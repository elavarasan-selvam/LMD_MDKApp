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
    // HELPER: PRODUCT KEY
    // ===============================
    function getProductKey(productID, uom) {
        return (productID || "") + "::" + (uom || "");
    }

    // ===============================
    // HELPER:
    // GET CHECKOUT PRODUCTS WHICH ARE STILL NOT FULLY DELIVERED
    // ===============================
    async function getCheckoutPendingProductsAfterDeliveredCheck(context, routeUUID, reloadVisitStopMap) {

        try {

            if (!routeUUID) {
                return [];
            }

            //====================================================
            // FETCH RELOAD REQUESTS FOR ROUTE
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

            const checkoutProductMap = {};

            if (documentItems && documentItems.length > 0) {

                for (let i = 0; i < documentItems.length; i++) {

                    const item = getReadItem(documentItems, i);

                    if (!item) {
                        continue;
                    }

                    // Exclude reload request delivery documents
                    if (uniqueReloadDeliveryDocs.includes(item.DocumentID)) {
                        continue;
                    }

                    const productID = item.ProductID || "";
                    const orderedUOM = item.OrderedUOM || item.ActualUOM || "";
                    const productKey = getProductKey(productID, orderedUOM);

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

            const pendingCheckoutProducts = [];

            for (const key in checkoutProductMap) {

                const product = checkoutProductMap[key];

                const pendingQty =
                    getSafeNumber(product.OrderedQuantity) -
                    getSafeNumber(product.DeliveredBeforeReloadCI);

                if (pendingQty > 0) {

                    pendingCheckoutProducts.push({
                        ProductKey: key,
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

    } else if (binding && binding.StopID) {

        const readStop = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            "$filter=StopID eq '" + binding.StopID + "'"
        );

        if (readStop && readStop.length > 0) {

            const stopEntity = getReadItem(readStop, 0);

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

    if (stopsResult && stopsResult.length > 0) {

        for (let i = 0; i < stopsResult.length; i++) {

            const stop = getReadItem(stopsResult, i);

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

    if (reloadCISequence === null) {

        alert("RELOAD_CI stop not found");

        appData.StartButton = false;
        appData.ReloadPendingCount = 0;
        appData.ReloadPendingProductList = [];

        clientAPI.getPageProxy().redraw();

        return true;
    }

    // ===============================
    // GET COMPLETED VISIT STOPS BEFORE RELOAD_CI
    // ===============================
    const reloadVisitStopMap = {};

    for (let i = 0; i < allStops.length; i++) {

        const stop = allStops[i];

        if (stop.StopType !== 'VISIT') {
            continue;
        }

        if (!stop.EndDateTime) {
            continue;
        }

        const visitSequence = Number(stop.__ReloadSequence || 0);

        if (visitSequence >= reloadCISequence) {
            continue;
        }

        reloadVisitStopMap[stop.StopUUID] = true;
    }

    // ===============================
    // FETCH DELIVERY ITEMS
    // ===============================
    const reloadDeliveryItems = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'DocumentItems',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}' and IsReturn eq false`
    );

    // ===============================
    // FETCH PLANNED RETURN ITEMS
    // ===============================
    const reloadReturnItems = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'DocumentItems',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}' and IsReturn eq true and IsManuallyAdded eq false`
    );

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
    // BUILD PLANNED RETURN MAP
    // Only completed VISIT stops before RELOAD_CI
    // Key is ProductID only, kept same as your old logic
    // ===============================
    const reloadReturnMap = {};

    if (reloadReturnItems && reloadReturnItems.length > 0) {

        for (let i = 0; i < reloadReturnItems.length; i++) {

            const item = getReadItem(reloadReturnItems, i);

            if (!item) {
                continue;
            }

            if (!reloadVisitStopMap[item.StopUUID]) {
                continue;
            }

            const productID = item.ProductID || "";
            const qty = getSafeNumber(item.DeliveredQuantity);

            if (!productID) {
                continue;
            }

            if (!reloadReturnMap[productID]) {
                reloadReturnMap[productID] = 0;
            }

            reloadReturnMap[productID] += qty;
        }
    }

    // ===============================
    // BUILD UNPLANNED RETURN MAP
    // Only completed VISIT stops before RELOAD_CI
    // Key is ProductID only, kept same as your old logic
    // ===============================
    const reloadUnplannedReturnMap = {};

    if (reloadUnplannedReturnItems && reloadUnplannedReturnItems.length > 0) {

        for (let i = 0; i < reloadUnplannedReturnItems.length; i++) {

            const item = getReadItem(reloadUnplannedReturnItems, i);

            if (!item) {
                continue;
            }

            if (!reloadVisitStopMap[item.StopUUID]) {
                continue;
            }

            const productID = item.ProductID || "";
            const qty = getSafeNumber(item.DeliveredQuantity);

            if (!productID) {
                continue;
            }

            if (!reloadUnplannedReturnMap[productID]) {
                reloadUnplannedReturnMap[productID] = 0;
            }

            reloadUnplannedReturnMap[productID] += qty;
        }
    }

    // ===============================
    // RELOAD PRODUCT MAP
    // Delivery shortage products from completed visits before RELOAD_CI
    // ===============================
    const reloadProductMap = {};

    if (reloadDeliveryItems && reloadDeliveryItems.length > 0) {

        for (let i = 0; i < reloadDeliveryItems.length; i++) {

            const item = getReadItem(reloadDeliveryItems, i);

            if (!item) {
                continue;
            }

            if (!reloadVisitStopMap[item.StopUUID]) {
                continue;
            }

            const productID = item.ProductID || "";
            const orderedUOM = item.OrderedUOM || item.ActualUOM || "";
            const productKey = getProductKey(productID, orderedUOM);

            if (!productID) {
                continue;
            }

            const ordered = getSafeNumber(item.OrderedQuantity);
            const delivered = getSafeNumber(item.DeliveredQuantity);

            if (!reloadProductMap[productKey]) {

                reloadProductMap[productKey] = {
                    ProductID: productID,
                    OrderedSum: ordered,
                    DeliveredSum: delivered,
                    OrderedUOM: orderedUOM,
                    RouteUUID: item.RouteUUID,
                    StopUUIDs: item.StopUUID ? [item.StopUUID] : [],
                    IsReturnOnlyProduct: false
                };

            } else {

                reloadProductMap[productKey].OrderedSum += ordered;
                reloadProductMap[productKey].DeliveredSum += delivered;

                if (item.StopUUID &&
                    !reloadProductMap[productKey].StopUUIDs.includes(item.StopUUID)) {
                    reloadProductMap[productKey].StopUUIDs.push(item.StopUUID);
                }

                reloadProductMap[productKey].IsReturnOnlyProduct = false;
            }
        }
    }

    // ===============================
    // ADD UNPLANNED RETURN-ONLY PRODUCTS
    // This is needed for CHOCO case
    // CHOCO has no delivery item in visit, but has unplanned return 2
    // So first it becomes CHOCO 2
    // Later checkout pending 20 will be merged into this same item
    // ===============================
    if (reloadUnplannedReturnItems && reloadUnplannedReturnItems.length > 0) {

        for (let i = 0; i < reloadUnplannedReturnItems.length; i++) {

            const item = getReadItem(reloadUnplannedReturnItems, i);

            if (!item) {
                continue;
            }

            if (!reloadVisitStopMap[item.StopUUID]) {
                continue;
            }

            const productID = item.ProductID || "";
            const orderedUOM = item.OrderedUOM || item.ActualUOM || "";
            const productKey = getProductKey(productID, orderedUOM);

            if (!productID) {
                continue;
            }

            if (!reloadProductMap[productKey]) {

                reloadProductMap[productKey] = {
                    ProductID: productID,
                    OrderedSum: 0,
                    DeliveredSum: 0,
                    OrderedUOM: orderedUOM,
                    RouteUUID: item.RouteUUID,
                    StopUUIDs: item.StopUUID ? [item.StopUUID] : [],
                    IsReturnOnlyProduct: true
                };
            }
        }
    }

    // ===============================
    // ADD PLANNED RETURN-ONLY PRODUCTS
    // ===============================
    if (reloadReturnItems && reloadReturnItems.length > 0) {

        for (let i = 0; i < reloadReturnItems.length; i++) {

            const item = getReadItem(reloadReturnItems, i);

            if (!item) {
                continue;
            }

            if (!reloadVisitStopMap[item.StopUUID]) {
                continue;
            }

            const productID = item.ProductID || "";
            const orderedUOM = item.OrderedUOM || item.ActualUOM || "";
            const productKey = getProductKey(productID, orderedUOM);

            if (!productID) {
                continue;
            }

            if (!reloadProductMap[productKey]) {

                reloadProductMap[productKey] = {
                    ProductID: productID,
                    OrderedSum: 0,
                    DeliveredSum: 0,
                    OrderedUOM: orderedUOM,
                    RouteUUID: item.RouteUUID,
                    StopUUIDs: item.StopUUID ? [item.StopUUID] : [],
                    IsReturnOnlyProduct: true
                };
            }
        }
    }

    // ===============================
    // CALCULATE RELOAD FINAL ACTUAL
    // Existing formula is kept
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

                    const cociItem = getReadItem(cociResult, 0);

                    reloadCheckoutActual = getSafeNumber(cociItem.ActualQuantity);
                }

            } catch (e) {
                reloadCheckoutActual = 0;
            }
        }

        const reloadReturnQty = reloadReturnMap[product.ProductID] || 0;
        const reloadUnplannedReturnQty = reloadUnplannedReturnMap[product.ProductID] || 0;

        const reloadFinalActual =
            reloadCheckoutActual +
            getSafeNumber(product.OrderedSum) -
            getSafeNumber(product.DeliveredSum) +
            reloadReturnQty +
            reloadUnplannedReturnQty;

        /*
        alert(
            "Reload Product Calculation" +
            "\nProduct: " + product.ProductID +
            "\nReload Checkout Actual: " + reloadCheckoutActual +
            "\nOrdered Sum: " + product.OrderedSum +
            "\nDelivered Sum: " + product.DeliveredSum +
            "\nPlanned Return Qty: " + reloadReturnQty +
            "\nUnplanned Return Qty: " + reloadUnplannedReturnQty +
            "\nIs Return Only: " + product.IsReturnOnlyProduct +
            "\nFinal Actual: " + reloadFinalActual
        );
        */

        if (reloadFinalActual > 0) {

            reloadPendingCount++;

            appData.ReloadPendingProductList.push({
                ProductID: product.ProductID,
                ActualQuantity: reloadFinalActual,
                UnloadedQuantity: 0,
                ActualUOM: product.OrderedUOM,
                RouteUUID: product.RouteUUID,
                StopUUID: product.StopUUIDs.join(','),
                IsReloadProduct: true,
                IsReturnOnlyProduct: product.IsReturnOnlyProduct === true,
                PlannedReturnQuantity: reloadReturnQty,
                UnplannedReturnQuantity: reloadUnplannedReturnQty,
                OrderedSum: product.OrderedSum,
                DeliveredSum: product.DeliveredSum
            });
        }
    }

    // ============================================================
    // ADDITIONAL CHECKOUT PENDING FEATURE
    //
    // IMPORTANT FIX:
    //
    // Earlier issue:
    // CHOCO was already added as return-only product with qty 2.
    // Then checkout pending CHOCO 20 was skipped because duplicate existed.
    //
    // New behavior:
    // If duplicate exists and it is return-only product,
    // add checkout pending qty into existing ActualQuantity.
    //
    // This gives:
    // CHOCO = return 2 + checkout pending 20 = 22
    //
    // But for LMD:
    // LMD already came from delivery shortage 10 - 8 = 2.
    // So we should NOT add checkout pending again.
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

            const existingPendingItem =
                appData.ReloadPendingProductList.find(item => {
                    return (item.ProductID || "") === checkoutProductID &&
                           (item.ActualUOM || "") === checkoutUOM;
                });

            if (existingPendingItem) {

                // ==========================================
                // THIS IS THE MAIN FIX
                //
                // If product already exists only because of return,
                // merge checkout pending into same product.
                //
                // Example:
                // CHOCO existing return = 2
                // CHOCO checkout pending = 20
                // Final CHOCO = 22
                // ==========================================
                if (existingPendingItem.IsReturnOnlyProduct === true) {

                    existingPendingItem.ActualQuantity =
                        getSafeNumber(existingPendingItem.ActualQuantity) +
                        checkoutPendingQty;

                    existingPendingItem.CheckoutPendingQuantity = checkoutPendingQty;
                    existingPendingItem.OrderedQuantity = checkoutProduct.OrderedQuantity;
                    existingPendingItem.DeliveredBeforeReloadCI = checkoutProduct.DeliveredBeforeReloadCI;
                    existingPendingItem.IsCheckoutPendingProduct = true;
                    existingPendingItem.IsMergedReturnAndCheckoutPending = true;

                    existingPendingItem.DocumentIDs = checkoutProduct.DocumentIDs
                        ? checkoutProduct.DocumentIDs.join(',')
                        : '';

                    existingPendingItem.DocumentItemIDs = checkoutProduct.DocumentItemIDs
                        ? checkoutProduct.DocumentItemIDs.join(',')
                        : '';

                    /*
                    alert(
                        "Merged Checkout Pending With Return-Only Product" +
                        "\nProduct: " + checkoutProductID +
                        "\nReturn Qty Already Existing: " +
                            (
                                getSafeNumber(existingPendingItem.PlannedReturnQuantity) +
                                getSafeNumber(existingPendingItem.UnplannedReturnQuantity)
                            ) +
                        "\nCheckout Pending Added: " + checkoutPendingQty +
                        "\nFinal Qty: " + existingPendingItem.ActualQuantity
                    );
                    */

                } else {

                    // For LMD type products, do not add again.
                    // Because LMD shortage is already calculated by existing delivery logic.
                    /*
                    alert(
                        "Skipped duplicate delivery shortage product" +
                        "\nProduct: " + checkoutProductID +
                        "\nExisting Qty: " + existingPendingItem.ActualQuantity +
                        "\nCheckout Pending Qty: " + checkoutPendingQty
                    );
                    */
                }

                continue;
            }

            // ==========================================
            // Product not already present.
            // Push checkout pending normally.
            // ==========================================
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
                IsReturnOnlyProduct: false,
                OrderedQuantity: checkoutProduct.OrderedQuantity,
                DeliveredBeforeReloadCI: checkoutProduct.DeliveredBeforeReloadCI,
                CheckoutPendingQuantity: checkoutPendingQty,
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
                "\nDelivered Before RELOAD_CI: " + checkoutProduct.DeliveredBeforeReloadCI +
                "\nPending: " + checkoutPendingQty +
                "\nUOM: " + checkoutUOM
            );
            */
        }
    }

    // ===============================
    // FINALIZE
    // Count should match final list length
    // Because some products are merged, not newly pushed
    // ===============================
    reloadPendingCount = appData.ReloadPendingProductList.length;

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