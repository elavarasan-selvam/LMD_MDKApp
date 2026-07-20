export default async function InitializeReloadCheckIn(clientAPI) {

    const appData = clientAPI.getAppClientData();

    appData.ReloadPendingProductList = [];

    const binding = clientAPI.getPageProxy().binding;

    // ===============================
    // HELPER: SAFE NUMBER
    // ===============================
    function getSafeNumber(value) {
        if (value === undefined || value === null || value === '') {
            return 0;
        }

        return Number(value) || 0;
    }

    // ===============================
    // HELPER: READ RESULT ITEM SAFELY
    // ===============================
    function getReadItem(result, index) {
        if (result && typeof result.getItem === 'function') {
            return result.getItem(index);
        }

        return result[index];
    }

    // ===============================
    // HELPER:
    // GET CHECKOUT PRODUCTS WHICH ARE STILL NOT FULLY DELIVERED
    //
    // This follows your Checkout_Stop_Items_List logic:
    // 1. Get ReloadRequest for route
    // 2. Get ReloadRequestDelivery documents
    // 3. Get checkout DocumentItems for route
    // 4. Exclude documents already present in ReloadRequestDelivery
    // 5. Aggregate checkout ordered qty
    // 6. Subtract delivered qty before RELOAD_CI
    // 7. Return only products where pending qty > 0
    // ===============================
    async function getCheckoutPendingProductsAfterDeliveredCheck(context, routeUUID, reloadVisitStopMap) {

        try {

            if (!routeUUID) {
                return [];
            }

            //====================================================
            // FETCH RELOAD REQUESTS FOR ROUTE
            // Same as Checkout_Stop_Items_List
            //====================================================
            const reloadRequests = await context.read(
                "/LMD_MDKApp/Services/API_LASTMILERELOADREQUEST.service",
                "ReloadRequest",
                [],
                `$filter=LastMileRouteUUID eq ${routeUUID}`
            );

            const reloadUUIDs = [];

            if (reloadRequests && reloadRequests.length > 0) {

                for (let i = 0; i < reloadRequests.length; i++) {

                    const item = getReadItem(reloadRequests, i);

                    if (item && item.LastMileReloadRequestUUID) {
                        reloadUUIDs.push(item.LastMileReloadRequestUUID);
                    }
                }
            }

            //====================================================
            // FETCH RELOAD REQUEST DELIVERY DOCUMENTS
            //====================================================
            const reloadDeliveryDocuments = [];

            if (reloadUUIDs.length > 0) {

                for (let i = 0; i < reloadUUIDs.length; i++) {

                    const reloadDeliveries = await context.read(
                        "/LMD_MDKApp/Services/API_LASTMILERELOADREQUEST.service",
                        "ReloadRequestDelivery",
                        [],
                        `$filter=LastMileReloadRequestUUID eq ${reloadUUIDs[i]}`
                    );

                    if (reloadDeliveries && reloadDeliveries.length > 0) {

                        for (let j = 0; j < reloadDeliveries.length; j++) {

                            const item = getReadItem(reloadDeliveries, j);

                            if (item && item.DeliveryDocument) {
                                reloadDeliveryDocuments.push(item.DeliveryDocument);
                            }
                        }
                    }
                }
            }

            const uniqueReloadDeliveryDocs = [...new Set(reloadDeliveryDocuments)];

            //====================================================
            // FETCH CHECKOUT DOCUMENT ITEMS
            //====================================================
            const documentItems = await context.read(
                "/LMD_MDKApp/Services/LMD_MA.service",
                "DocumentItems",
                [],
                `$filter=IsReturn eq false and RouteUUID eq guid'${routeUUID}'`
            );

            //====================================================
            // CHECKOUT PRODUCT MAP
            // Only items whose DocumentID is NOT in ReloadRequestDelivery
            //====================================================
            const checkoutProductMap = {};

            if (documentItems && documentItems.length > 0) {

                for (let i = 0; i < documentItems.length; i++) {

                    const item = getReadItem(documentItems, i);

                    if (!item) {
                        continue;
                    }

                    // Same filter from your Checkout_Stop_Items_List
                    if (uniqueReloadDeliveryDocs.includes(item.DocumentID)) {
                        continue;
                    }

                    const productID = item.ProductID || "";
                    const orderedUOM = item.OrderedUOM || "";
                    const productKey = productID + "::" + orderedUOM;

                    if (!productID) {
                        continue;
                    }

                    const orderedQty = getSafeNumber(item.OrderedQuantity);
                    const deliveredQty = getSafeNumber(item.DeliveredQuantity);

                    if (!checkoutProductMap[productKey]) {

                        checkoutProductMap[productKey] = {
                            ProductID: productID,
                            OrderedQuantity: orderedQty,
                            DeliveredBeforeReloadCI: 0,
                            OrderedUOM: orderedUOM,
                            RouteUUID: item.RouteUUID || routeUUID,
                            StopUUIDs: item.StopUUID ? [item.StopUUID] : [],
                            DocumentIDs: item.DocumentID ? [item.DocumentID] : [],
                            DocumentItemIDs: item.DocumentItemID ? [item.DocumentItemID] : []
                        };

                    } else {

                        checkoutProductMap[productKey].OrderedQuantity += orderedQty;

                        if (item.StopUUID &&
                            !checkoutProductMap[productKey].StopUUIDs.includes(item.StopUUID)) {
                            checkoutProductMap[productKey].StopUUIDs.push(item.StopUUID);
                        }

                        if (item.DocumentID &&
                            !checkoutProductMap[productKey].DocumentIDs.includes(item.DocumentID)) {
                            checkoutProductMap[productKey].DocumentIDs.push(item.DocumentID);
                        }

                        if (item.DocumentItemID &&
                            !checkoutProductMap[productKey].DocumentItemIDs.includes(item.DocumentItemID)) {
                            checkoutProductMap[productKey].DocumentItemIDs.push(item.DocumentItemID);
                        }
                    }

                    // Delivered qty only from completed visits before RELOAD_CI
                    if (reloadVisitStopMap[item.StopUUID]) {
                        checkoutProductMap[productKey].DeliveredBeforeReloadCI += deliveredQty;
                    }
                }
            }

            //====================================================
            // RETURN ONLY NOT FULLY DELIVERED PRODUCTS
            // Pending = Ordered - DeliveredBeforeReloadCI
            // If pending <= 0, product is already delivered, so do not add
            //====================================================
            const pendingCheckoutProducts = [];

            for (const key in checkoutProductMap) {

                const product = checkoutProductMap[key];

                const pendingQty =
                    getSafeNumber(product.OrderedQuantity) -
                    getSafeNumber(product.DeliveredBeforeReloadCI);

                if (pendingQty > 0) {

                    pendingCheckoutProducts.push({
                        ProductID: product.ProductID,
                        PendingQuantity: pendingQty,
                        OrderedQuantity: product.OrderedQuantity,
                        DeliveredBeforeReloadCI: product.DeliveredBeforeReloadCI,
                        OrderedUOM: product.OrderedUOM,
                        RouteUUID: product.RouteUUID || routeUUID,
                        StopUUIDs: product.StopUUIDs,
                        DocumentIDs: product.DocumentIDs,
                        DocumentItemIDs: product.DocumentItemIDs
                    });
                }
            }

            return pendingCheckoutProducts;

        } catch (e) {
            // alert("Error in getCheckoutPendingProductsAfterDeliveredCheck: " + e);
            return [];
        }
    }

    // ===============================
    // SET CURRENT STOP
    // ===============================
    if (binding && binding.StopUUID) {

        appData.currentStop = binding;
        appData.currentRouteUUID = binding.RouteUUID;

        //alert("StopUUID: " + binding.StopUUID + "\nRouteUUID: " + binding.RouteUUID);

    } else if (binding && binding.StopID) {

        const readStop = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            "$filter=StopID eq '" + binding.StopID + "'"
        );

        if (readStop && readStop.length > 0) {

            const stopEntity = readStop.getItem(0);

            appData.currentStop = stopEntity;
            appData.currentRouteUUID = stopEntity.RouteUUID;

        } else {
            alert("Stop not found");
        }
    }

    const routeUUID = appData.currentRouteUUID;

    if (!routeUUID) {
        return true;
    }

    // ===============================
    // FETCH ALL STOPS
    // ===============================
    const stopsResult = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'Stops',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}'`
    );

    let reloadCheckoutStopUUID = null;
    let reloadCISequence = null;

    const allStops = [];

    // ===============================
    // GET CHECKOUT AND RELOAD_CI SEQUENCE
    // ===============================
    if (stopsResult && stopsResult.length > 0) {

        for (let i = 0; i < stopsResult.length; i++) {

            const stop = stopsResult.getItem(i);

            const stopSequence = Number(
                stop.Sequence ||
                stop.StopSequence ||
                stop.VisitSequence ||
                stop.SequenceNumber ||
                stop.SequenceNo ||
                stop.SortOrder ||
                (i + 1)
            );

            stop.__ReloadSequence = stopSequence;

            allStops.push(stop);

            if (stop.StopType === 'CHECKOUT') {
                reloadCheckoutStopUUID = stop.StopUUID;
            }

            if (stop.StopType === 'RELOAD_CI') {
                reloadCISequence = stopSequence;
            }
        }
    }

    // If RELOAD_CI is not found, this Reload CheckIn should not calculate anything
    if (reloadCISequence === null) {

        alert("RELOAD_CI stop not found");

        appData.StartButton = false;
        appData.ReloadPendingCount = 0;
        appData.ReloadPendingProductList = [];

        clientAPI.getPageProxy().redraw();

        return true;
    }

    // ===============================
    // GET RELOAD VISIT STOPS
    // Only completed VISIT stops before RELOAD_CI
    // ===============================
    const reloadVisitStopMap = {};

    for (let i = 0; i < allStops.length; i++) {

        const stop = allStops[i];

        if (stop.StopType !== 'VISIT') {
            continue;
        }

        // Ignore visits not completed
        if (!stop.EndDateTime) {
            continue;
        }

        const visitSequence = Number(stop.__ReloadSequence || 0);

        // Take only visits before RELOAD_CI
        if (visitSequence >= reloadCISequence) {
            continue;
        }

        reloadVisitStopMap[stop.StopUUID] = true;
    }

    /*alert(
        "Reload Checkout StopUUID: " + reloadCheckoutStopUUID +
        "\nReload CI Sequence: " + reloadCISequence +
        "\nReload Visit Stops: " + Object.keys(reloadVisitStopMap).join(', ')
    );*/

    // ===============================
    // FETCH DELIVERY ITEMS
    // ===============================
    const reloadDeliveryItems = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'DocumentItems',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}' and IsReturn eq false`
    );

    //alert("Reload Delivery Items Count: " + (reloadDeliveryItems ? reloadDeliveryItems.length : 0));

    // ===============================
    // FETCH PLANNED RETURN ITEMS
    // ===============================
    const reloadReturnItems = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'DocumentItems',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}' and IsReturn eq true and IsManuallyAdded eq false`
    );

    //alert("Reload Planned Return Items Count: " + (reloadReturnItems ? reloadReturnItems.length : 0));

    // ===============================
    // FETCH UNPLANNED RETURN ITEMS
    // ===============================
    const reloadUnplannedReturnItems = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'DocumentItems',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}' and IsReturn eq true and IsManuallyAdded eq true`
    );

    let reloadPendingCount = 0;

    // ===============================
    // BUILD RELOAD RETURN MAP
    // Only completed VISIT stops before RELOAD_CI
    // ===============================
    const reloadReturnMap = {};

    if (reloadReturnItems && reloadReturnItems.length > 0) {

        for (let i = 0; i < reloadReturnItems.length; i++) {

            const item = reloadReturnItems.getItem(i);

            if (!reloadVisitStopMap[item.StopUUID]) {
                continue;
            }

            const productID = item.ProductID;
            const qty = Number(item.DeliveredQuantity || 0);

            if (!reloadReturnMap[productID]) {
                reloadReturnMap[productID] = 0;
            }

            reloadReturnMap[productID] += qty;
        }
    }

    // ===============================
    // BUILD RELOAD UNPLANNED RETURN MAP
    // Only completed VISIT stops before RELOAD_CI
    // ===============================
    const reloadUnplannedReturnMap = {};

    if (reloadUnplannedReturnItems && reloadUnplannedReturnItems.length > 0) {

        for (let i = 0; i < reloadUnplannedReturnItems.length; i++) {

            const item = reloadUnplannedReturnItems.getItem(i);

            if (!reloadVisitStopMap[item.StopUUID]) {
                continue;
            }

            const productID = item.ProductID;
            const qty = Number(item.DeliveredQuantity || 0);

            if (!reloadUnplannedReturnMap[productID]) {
                reloadUnplannedReturnMap[productID] = 0;
            }

            reloadUnplannedReturnMap[productID] += qty;
        }
    }

    // ===============================
    // RELOAD PRODUCT MAP
    // Only completed VISIT stops before RELOAD_CI
    // ===============================
    const reloadProductMap = {};

    // ===============================
    // LOOP DELIVERY ITEMS
    // ===============================
    if (reloadDeliveryItems && reloadDeliveryItems.length > 0) {

        for (let i = 0; i < reloadDeliveryItems.length; i++) {

            const item = reloadDeliveryItems.getItem(i);

            if (!reloadVisitStopMap[item.StopUUID]) {
                continue;
            }

            const productKey = item.ProductID + "::" + item.OrderedUOM;

            const ordered = Number(item.OrderedQuantity) || 0;
            const delivered = Number(item.DeliveredQuantity) || 0;

            if (!reloadProductMap[productKey]) {

                reloadProductMap[productKey] = {
                    ProductID: item.ProductID,
                    OrderedSum: ordered,
                    DeliveredSum: delivered,
                    OrderedUOM: item.OrderedUOM,
                    RouteUUID: item.RouteUUID,
                    StopUUIDs: [item.StopUUID]
                };

            } else {

                reloadProductMap[productKey].OrderedSum += ordered;
                reloadProductMap[productKey].DeliveredSum += delivered;

                if (!reloadProductMap[productKey].StopUUIDs.includes(item.StopUUID)) {
                    reloadProductMap[productKey].StopUUIDs.push(item.StopUUID);
                }
            }
        }
    }

    //alert("Reload Product Map Count: " + Object.keys(reloadProductMap).length);

    // ===============================
    // ADD UNPLANNED RETURN-ONLY PRODUCTS
    // Only completed VISIT stops before RELOAD_CI
    // ===============================
    if (reloadUnplannedReturnItems && reloadUnplannedReturnItems.length > 0) {

        for (let i = 0; i < reloadUnplannedReturnItems.length; i++) {

            const item = reloadUnplannedReturnItems.getItem(i);

            if (!reloadVisitStopMap[item.StopUUID]) {
                continue;
            }

            const productKey = item.ProductID + "::" + item.OrderedUOM;

            if (!reloadProductMap[productKey]) {

                reloadProductMap[productKey] = {
                    ProductID: item.ProductID,
                    OrderedSum: 0,
                    DeliveredSum: 0,
                    OrderedUOM: item.OrderedUOM,
                    RouteUUID: item.RouteUUID,
                    StopUUIDs: [item.StopUUID]
                };
            }
        }
    }

    //alert("Reload Product Map Count After Unplanned Return: " + Object.keys(reloadProductMap).length);

    // ===============================
    // ADD PLANNED RETURN-ONLY PRODUCTS
    // Only completed VISIT stops before RELOAD_CI
    // ===============================
    if (reloadReturnItems && reloadReturnItems.length > 0) {

        for (let i = 0; i < reloadReturnItems.length; i++) {

            const item = reloadReturnItems.getItem(i);

            if (!reloadVisitStopMap[item.StopUUID]) {
                continue;
            }

            const productKey = item.ProductID + "::" + item.OrderedUOM;

            if (!reloadProductMap[productKey]) {

                reloadProductMap[productKey] = {
                    ProductID: item.ProductID,
                    OrderedSum: 0,
                    DeliveredSum: 0,
                    OrderedUOM: item.OrderedUOM,
                    RouteUUID: item.RouteUUID,
                    StopUUIDs: [item.StopUUID]
                };
            }
        }
    }

    // ===============================
    // CALCULATE RELOAD FINAL ACTUAL
    // Your existing logic is untouched
    // ===============================
    for (const key in reloadProductMap) {

        const product = reloadProductMap[key];

        let reloadCheckoutActual = 0;

        if (reloadCheckoutStopUUID) {

            try {

                const cociResult = await clientAPI.read(
                    '/LMD_MDKApp/Services/LMD_MA.service',
                    'COCIProducts',
                    [],
                    `$filter=StopUUID eq guid'${reloadCheckoutStopUUID}' and ProductID eq '${product.ProductID}'`
                );

                if (cociResult && cociResult.length > 0) {

                    const cociItem = cociResult.getItem(0);

                    reloadCheckoutActual = Number(cociItem.ActualQuantity) || 0;
                }

            } catch (e) {
                reloadCheckoutActual = 0;
            }
        }

        // ===============================
        // ADD RELOAD RETURN QTY
        // ===============================
        const reloadReturnQty = reloadReturnMap[product.ProductID] || 0;
        const reloadUnplannedReturnQty = reloadUnplannedReturnMap[product.ProductID] || 0;

        // ===============================
        // RELOAD FINAL FORMULA
        // ===============================
        const reloadFinalActual =
            reloadCheckoutActual +
            product.OrderedSum -
            product.DeliveredSum +
            reloadReturnQty +
            reloadUnplannedReturnQty;

        /*alert(
            "Product: " + product.ProductID +
            "\nReload Checkout: " + reloadCheckoutActual +
            "\nOrdered: " + product.OrderedSum +
            "\nDelivered: " + product.DeliveredSum +
            "\nReload Returned: " + reloadReturnQty +
            "\nReload Unplanned Return: " + reloadUnplannedReturnQty +
            "\n------------------" +
            "\nReload Final: " + reloadFinalActual
        );*/

        if (reloadFinalActual > 0) {

            reloadPendingCount++;

            appData.ReloadPendingProductList.push({
                ProductID: product.ProductID,
                ActualQuantity: reloadFinalActual,
                UnloadedQuantity: 0,
                ActualUOM: product.OrderedUOM,
                RouteUUID: product.RouteUUID,
                StopUUID: product.StopUUIDs.join(',')
            });
        }
    }

    // ============================================================
    // ADDITIONAL FEATURE ONLY
    //
    // Existing above logic already completed.
    // Now get checkout products.
    // If product is not fully delivered before RELOAD_CI,
    // and if product is not already in ReloadPendingProductList,
    // add remaining qty to ReloadPendingProductList.
    //
    // Fully delivered products will NOT be added.
    // ============================================================
    const checkoutPendingProducts =
        await getCheckoutPendingProductsAfterDeliveredCheck(
            clientAPI,
            routeUUID,
            reloadVisitStopMap
        );

    if (checkoutPendingProducts && checkoutPendingProducts.length > 0) {

        for (let i = 0; i < checkoutPendingProducts.length; i++) {

            const checkoutProduct = checkoutPendingProducts[i];

            const checkoutProductID = checkoutProduct.ProductID || "";
            const checkoutUOM = checkoutProduct.OrderedUOM || "";
            const checkoutPendingQty = getSafeNumber(checkoutProduct.PendingQuantity);

            if (!checkoutProductID) {
                continue;
            }

            if (checkoutPendingQty <= 0) {
                continue;
            }

            // Compare product with already prepared ReloadPendingProductList
            // If already present, do not add duplicate
            const alreadyExistsInPendingList =
                appData.ReloadPendingProductList.some(item => {
                    return (item.ProductID || "") === checkoutProductID &&
                           (item.ActualUOM || "") === checkoutUOM;
                });

            if (alreadyExistsInPendingList) {
                continue;
            }

            reloadPendingCount++;

            appData.ReloadPendingProductList.push({
                ProductID: checkoutProductID,
                ActualQuantity: checkoutPendingQty,
                UnloadedQuantity: 0,
                ActualUOM: checkoutUOM,
                RouteUUID: checkoutProduct.RouteUUID || routeUUID,
                StopUUID: checkoutProduct.StopUUIDs && checkoutProduct.StopUUIDs.length > 0
                    ? checkoutProduct.StopUUIDs.join(',')
                    : '',
                IsCheckoutPendingProduct: true,
                OrderedQuantity: checkoutProduct.OrderedQuantity,
                DeliveredBeforeReloadCI: checkoutProduct.DeliveredBeforeReloadCI,
                DocumentIDs: checkoutProduct.DocumentIDs
                    ? checkoutProduct.DocumentIDs.join(',')
                    : '',
                DocumentItemIDs: checkoutProduct.DocumentItemIDs
                    ? checkoutProduct.DocumentItemIDs.join(',')
                    : ''
            });

            /*
            alert(
                "Added Checkout Pending Product" +
                "\nProduct: " + checkoutProductID +
                "\nOrdered: " + checkoutProduct.OrderedQuantity +
                "\nDelivered Before Reload CI: " + checkoutProduct.DeliveredBeforeReloadCI +
                "\nPending: " + checkoutPendingQty +
                "\nUOM: " + checkoutUOM
            );
            */
        }
    }

    // ===============================
    // FINALIZE
    // ===============================
    appData.StartButton = (reloadPendingCount > 0);
    appData.ReloadPendingCount = reloadPendingCount;

    /*
    alert(
        "Final Reload Pending Count: " + reloadPendingCount +
        "\nFinal List Count: " + appData.ReloadPendingProductList.length
    );
    */

    clientAPI.getPageProxy().redraw();

    return true;
}