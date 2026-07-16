export default async function InitializeCheckinTruckLoadandTruckInfoFlag(clientAPI) {

    const appData = clientAPI.getAppClientData();

    if (!appData.CheckinTruckLoadConfirmedByStop) {
        appData.CheckinTruckLoadConfirmedByStop = {};
    }

    if (!appData.CheckinTruckInfoConfirmedByStop) {
        appData.CheckinTruckInfoConfirmedByStop = {};
    }

    if (!appData.CheckinCOCIPaymentConfirmedByStop) {
        appData.CheckinCOCIPaymentConfirmedByStop = {};
    }

    appData.PendingProductList = [];

    const binding = clientAPI.getPageProxy().binding;

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

            const stopEntity = readStop.getItem(0);

            appData.currentStop = stopEntity;
            appData.currentRouteUUID = stopEntity.RouteUUID;

        } else {
            alert("Stop not found");
        }
    }

    const routeUUID = appData.currentRouteUUID;

    if (!routeUUID) {
        alert("RouteUUID not found");
        return true;
    }

    //alert("NORMAL CHECKIN STARTED\nRouteUUID: " + routeUUID);

    // ===============================
    // FETCH ALL STOPS
    // ===============================
    const stopsResult = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'Stops',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}'`
    );

    let checkoutStopUUID = null;
    let reloadCIStopUUID = null;
    let reloadCOStopUUID = null;

    if (stopsResult && stopsResult.length > 0) {

        for (let i = 0; i < stopsResult.length; i++) {

            const stop = stopsResult.getItem(i);

            if (stop.StopType === 'CHECKOUT') {
                checkoutStopUUID = stop.StopUUID;
            }

            if (stop.StopType === 'RELOAD_CI') {
                reloadCIStopUUID = stop.StopUUID;
            }

            if (stop.StopType === 'RELOAD_CO') {
                reloadCOStopUUID = stop.StopUUID;
            }
        }
    }

    const hasReloadRequest = !!(reloadCIStopUUID && reloadCOStopUUID);

   /* alert(
        "Checkout StopUUID: " + checkoutStopUUID +
        "\nReload CI StopUUID: " + reloadCIStopUUID +
        "\nReload CO StopUUID: " + reloadCOStopUUID +
        "\nHas Reload: " + hasReloadRequest
    );*/

    // ===============================
    // FETCH DELIVERY ITEMS
    // ===============================
    const deliveryItems = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'DocumentItems',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}' and IsReturn eq false`
    );

    // ===============================
    // FETCH RETURN ITEMS
    // ===============================
    const returnItems = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'DocumentItems',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}' and IsReturn eq true and IsManuallyAdded eq false`
    );

    // ===============================
    // FETCH UNPLANNED RETURN ITEMS
    // ===============================
    const unplannedReturnItems = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'DocumentItems',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}' and IsReturn eq true and IsManuallyAdded eq true`
    );

    /*alert(
        "Delivery Items Count: " + (deliveryItems ? deliveryItems.length : 0) +
        "\nReturn Items Count: " + (returnItems ? returnItems.length : 0) +
        "\nUnplanned Return Items Count: " + (unplannedReturnItems ? unplannedReturnItems.length : 0)
    );*/

    let pendingCount = 0;

    if (!deliveryItems || deliveryItems.length === 0) {
        alert("No delivery items found");
        return true;
    }

    // ===============================
    // BUILD RETURN MAP
    // ===============================
    const returnMap = {};

    if (returnItems && returnItems.length > 0) {

        for (let i = 0; i < returnItems.length; i++) {

            const item = returnItems.getItem(i);

            const productID = item.ProductID;
            const qty = Number(item.DeliveredQuantity || 0);

            if (!returnMap[productID]) {
                returnMap[productID] = 0;
            }

            returnMap[productID] += qty;
        }
    }

    // ===============================
    // BUILD UNPLANNED RETURN MAP
    // ===============================
    const unplannedReturnMap = {};

    if (unplannedReturnItems && unplannedReturnItems.length > 0) {

        for (let i = 0; i < unplannedReturnItems.length; i++) {

            const item = unplannedReturnItems.getItem(i);

            const productID = item.ProductID;
            const qty = Number(item.DeliveredQuantity || 0);

            if (!unplannedReturnMap[productID]) {
                unplannedReturnMap[productID] = 0;
            }

            unplannedReturnMap[productID] += qty;
        }
    }

    /*alert(
        "Return Map: " + JSON.stringify(returnMap) +
        "\nUnplanned Return Map: " + JSON.stringify(unplannedReturnMap)
    );*/    

    // ===============================
    // DELIVERY MAP - YOUR OLD LOGIC
    // ===============================
    const productMap = {};

    for (let i = 0; i < deliveryItems.length; i++) {

        const item = deliveryItems.getItem(i);

        const productKey = item.ProductID + "::" + item.OrderedUOM;

        const ordered = Number(item.OrderedQuantity) || 0;
        const delivered = Number(item.DeliveredQuantity) || 0;

        if (!productMap[productKey]) {

            productMap[productKey] = {
                ProductID: item.ProductID,
                OrderedSum: ordered,
                DeliveredSum: delivered,
                OrderedUOM: item.OrderedUOM,
                RouteUUID: item.RouteUUID,
                StopUUIDs: [item.StopUUID]
            };

        } else {

            productMap[productKey].OrderedSum += ordered;
            productMap[productKey].DeliveredSum += delivered;

            if (!productMap[productKey].StopUUIDs.includes(item.StopUUID)) {
                productMap[productKey].StopUUIDs.push(item.StopUUID);
            }
        }
    }

    // ===============================
    // ADD UNPLANNED RETURN-ONLY PRODUCTS
    // ===============================
    if (unplannedReturnItems && unplannedReturnItems.length > 0) {

        for (let i = 0; i < unplannedReturnItems.length; i++) {

            const item = unplannedReturnItems.getItem(i);

            const productKey = item.ProductID + "::" + item.OrderedUOM;

            if (!productMap[productKey]) {

                productMap[productKey] = {
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
    // ADD PLANNED RETURN-ONLY PRODUCTS
    // ===============================
    if (returnItems && returnItems.length > 0) {

        for (let i = 0; i < returnItems.length; i++) {

            const item = returnItems.getItem(i);

            const productKey = item.ProductID + "::" + item.OrderedUOM;

            if (!productMap[productKey]) {

                productMap[productKey] = {
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

    //alert("Product Map Count: " + Object.keys(productMap).length);

    // ===============================
    // READ RELOAD_CI COCI PRODUCTS
    // This is the important correction
    // We read unloaded qty from many possible fields
    // ===============================
    const reloadCIProductMapByProductID = {};
    const reloadCIProductMapByKey = {};

    if (reloadCIStopUUID) {

        try {

            const reloadCIProducts = await clientAPI.read(
                '/LMD_MDKApp/Services/LMD_MA.service',
                'COCIProducts',
                [],
                `$filter=StopUUID eq guid'${reloadCIStopUUID}'`
            );

            //alert("ReloadCI COCI Count: " + (reloadCIProducts ? reloadCIProducts.length : 0));

            if (reloadCIProducts && reloadCIProducts.length > 0) {

                for (let i = 0; i < reloadCIProducts.length; i++) {

                    const reloadCIItem = reloadCIProducts.getItem(i);

                    alert("ReloadCI Raw Item: " + JSON.stringify(reloadCIItem));

                    const productID = reloadCIItem.ProductID;

                    const uom =
                        reloadCIItem.ActualUOM ||
                        reloadCIItem.OrderedUOM ||
                        reloadCIItem.UOM ||
                        "";

                    const qty =
                        Number(reloadCIItem.UnloadedQuantity || 0) ||
                        Number(reloadCIItem.ActualUnloadedQuantity || 0) ||
                        Number(reloadCIItem.UnloadedQty || 0) ||
                        Number(reloadCIItem.ActualQuantity || 0) ||
                        Number(reloadCIItem.Quantity || 0) ||
                        0;

                    const productKey = productID + "::" + uom;

                    if (!reloadCIProductMapByProductID[productID]) {
                        reloadCIProductMapByProductID[productID] = 0;
                    }

                    reloadCIProductMapByProductID[productID] += qty;

                    if (!reloadCIProductMapByKey[productKey]) {
                        reloadCIProductMapByKey[productKey] = 0;
                    }

                    reloadCIProductMapByKey[productKey] += qty;
                }
            }

        } catch (e) {
            alert("Error reading RELOAD_CI COCIProducts: " + e);
        }
    }

    /*alert(
        "ReloadCI Product Map By ProductID: " + JSON.stringify(reloadCIProductMapByProductID) +
        "\nReloadCI Product Map By Key: " + JSON.stringify(reloadCIProductMapByKey)
    );*/

    // ===============================
    // CALCULATE FINAL ACTUAL
    // ===============================
    for (const key in productMap) {

        const product = productMap[key];

        let checkoutActual = 0;

        if (checkoutStopUUID) {

            try {

                const cociResult = await clientAPI.read(
                    '/LMD_MDKApp/Services/LMD_MA.service',
                    'COCIProducts',
                    [],
                    `$filter=StopUUID eq guid'${checkoutStopUUID}' and ProductID eq '${product.ProductID}'`
                );

                if (cociResult && cociResult.length > 0) {

                    const cociItem = cociResult.getItem(0);

                    checkoutActual = Number(cociItem.ActualQuantity) || 0;
                }

            } catch (e) {
                checkoutActual = 0;
            }
        }

        const returnQty = returnMap[product.ProductID] || 0;
        const unplannedReturnQty = unplannedReturnMap[product.ProductID] || 0;

        // ===============================
        // OLD FORMULA - SAME AS YOUR ORIGINAL
        // ===============================
        const oldFinalActual =
            checkoutActual +
            product.OrderedSum -
            product.DeliveredSum +
            returnQty +
            unplannedReturnQty;

        // ===============================
        // GET RELOAD_CI UNLOADED QTY
        // First try ProductID + UOM key
        // If not found, try only ProductID
        // ===============================
        const reloadCIByKey = reloadCIProductMapByKey[key] || 0;
        const reloadCIByProduct = reloadCIProductMapByProductID[product.ProductID] || 0;

        const reloadCIActual = hasReloadRequest
            ? (reloadCIByKey || reloadCIByProduct || 0)
            : 0;

        const finalActual = oldFinalActual - reloadCIActual;


        if (finalActual > 0) {

            pendingCount++;

            appData.PendingProductList.push({
                ProductID: product.ProductID,
                ActualQuantity: finalActual,
                UnloadedQuantity: 0,
                ActualUOM: product.OrderedUOM,
                RouteUUID: product.RouteUUID,
                StopUUID: product.StopUUIDs.join(',')
            });

        }
    }

    // ===============================
    // FINALIZE
    // ===============================
    appData.StartButton = (pendingCount > 0);
    appData.PendingCount = pendingCount;

    clientAPI.getPageProxy().redraw();

    return true;
}