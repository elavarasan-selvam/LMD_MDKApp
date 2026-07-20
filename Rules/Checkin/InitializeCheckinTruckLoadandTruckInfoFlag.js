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
    // HELPER: SAFE NUMBER
    // ===============================
    function getSafeNumber(value) {
        if (value === undefined || value === null || value === '') {
            return 0;
        }

        return Number(value) || 0;
    }

    // ===============================
    // HELPER: READ ITEM SAFELY
    // ===============================
    function getReadItem(result, index) {
        if (result && typeof result.getItem === 'function') {
            return result.getItem(index);
        }

        return result[index];
    }

    // ===============================
    // HELPER: GET STOP SEQUENCE
    // ===============================
    function getStopSequence(stop, index) {
        return Number(
            stop.Sequence ||
            stop.StopSequence ||
            stop.VisitSequence ||
            stop.SequenceNumber ||
            stop.SequenceNo ||
            stop.SortOrder ||
            (index + 1)
        );
    }

    // ===============================
    // HELPER: GET UOM
    // ===============================
    function getItemUOM(item) {
        return (
            item.ActualUOM ||
            item.OrderedUOM ||
            item.UOM ||
            item.BaseUOM ||
            ""
        );
    }

    // ===============================
    // HELPER: RELOAD CI ACTUAL QTY
    //
    // This is the actual qty created in RELOAD_CI COCIProducts.
    // Example: ReloadCI ActualQuantity = 25
    // ===============================
    function getReloadCIActualQuantity(item) {
        return (
            getSafeNumber(item.ActualQuantity) ||
            getSafeNumber(item.OrderedQuantityInput) ||
            getSafeNumber(item.OrderedQuantity) ||
            getSafeNumber(item.Quantity) ||
            0
        );
    }

    // ===============================
    // HELPER: RELOAD CI UNLOADED QTY
    //
    // User unloads some qty at RELOAD_CI.
    // Final check-in should carry only remaining.
    // Remaining = ActualQuantity - UnloadedQuantity
    // ===============================
    function getReloadCIUnloadedQuantity(item) {
        return (
            getSafeNumber(item.UnloadedQuantity) ||
            getSafeNumber(item.ActualUnloadedQuantity) ||
            getSafeNumber(item.UnloadedQty) ||
            getSafeNumber(item.UnloadedQuantityInput) ||
            0
        );
    }

    // ===============================
    // HELPER: RELOAD CO REGISTERED / LOADED QTY
    //
    // This is reload checkout / reload request loaded qty.
    // ===============================
    function getReloadCOActualQuantity(item) {
        return (
            getSafeNumber(item.ActualQuantity) ||
            getSafeNumber(item.LoadedQuantity) ||
            getSafeNumber(item.ActualLoadedQuantity) ||
            getSafeNumber(item.LoadedQty) ||
            getSafeNumber(item.OrderedQuantityInput) ||
            getSafeNumber(item.OrderedQuantity) ||
            getSafeNumber(item.Quantity) ||
            0
        );
    }

    // ===============================
    // HELPER: ADD PRODUCT TO PRODUCT MAP
    // ===============================
    function addProductToMap(productMap, productID, uom, routeUUID, stopUUID) {

        if (!productID) {
            return;
        }

        const productKey = productID + "::" + (uom || "");

        if (!productMap[productKey]) {

            productMap[productKey] = {
                ProductID: productID,
                OrderedSum: 0,
                DeliveredSum: 0,
                OrderedUOM: uom || "",
                RouteUUID: routeUUID,
                StopUUIDs: stopUUID ? [stopUUID] : []
            };

        } else {

            if (stopUUID && !productMap[productKey].StopUUIDs.includes(stopUUID)) {
                productMap[productKey].StopUUIDs.push(stopUUID);
            }
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
        alert("RouteUUID not found");
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

    let checkoutStopUUID = null;
    let reloadCIStopUUID = null;
    let reloadCOStopUUID = null;

    let reloadCISequence = null;
    let reloadCOSequence = null;

    const allStops = [];

    if (stopsResult && stopsResult.length > 0) {

        for (let i = 0; i < stopsResult.length; i++) {

            const stop = getReadItem(stopsResult, i);

            if (!stop) {
                continue;
            }

            const stopSequence = getStopSequence(stop, i);

            stop.__CheckinSequence = stopSequence;

            allStops.push(stop);

            if (stop.StopType === 'CHECKOUT') {
                checkoutStopUUID = stop.StopUUID;
            }

            if (stop.StopType === 'RELOAD_CI') {
                reloadCIStopUUID = stop.StopUUID;
                reloadCISequence = stopSequence;
            }

            if (stop.StopType === 'RELOAD_CO') {
                reloadCOStopUUID = stop.StopUUID;
                reloadCOSequence = stopSequence;
            }
        }
    }

    const hasReloadRequest = !!(reloadCIStopUUID && reloadCOStopUUID);

    // ===============================
    // AFTER RELOAD VISIT STOPS
    //
    // Primary:
    //      completed VISIT stops after RELOAD_CO
    //
    // Fallback:
    //      if RELOAD_CO sequence not available,
    //      use completed VISIT stops after RELOAD_CI
    // ===============================
    const afterReloadCOVisitStopMap = {};
    const afterReloadCIVisitStopMap = {};

    if (hasReloadRequest) {

        for (let i = 0; i < allStops.length; i++) {

            const stop = allStops[i];

            if (!stop || stop.StopType !== 'VISIT') {
                continue;
            }

            if (!stop.EndDateTime) {
                continue;
            }

            const visitSequence = Number(stop.__CheckinSequence || 0);

            if (reloadCOSequence !== null && reloadCOSequence !== undefined) {
                if (visitSequence > reloadCOSequence) {
                    afterReloadCOVisitStopMap[stop.StopUUID] = true;
                }
            }

            if (reloadCISequence !== null && reloadCISequence !== undefined) {
                if (visitSequence > reloadCISequence) {
                    afterReloadCIVisitStopMap[stop.StopUUID] = true;
                }
            }
        }
    }

    const afterReloadVisitStopMap =
        Object.keys(afterReloadCOVisitStopMap).length > 0
            ? afterReloadCOVisitStopMap
            : afterReloadCIVisitStopMap;

    /*
    alert(
        "FINAL CHECKIN STARTED" +
        "\nRouteUUID: " + routeUUID +
        "\nCheckout StopUUID: " + checkoutStopUUID +
        "\nReload CI StopUUID: " + reloadCIStopUUID +
        "\nReload CO StopUUID: " + reloadCOStopUUID +
        "\nHas Reload: " + hasReloadRequest +
        "\nReload CI Sequence: " + reloadCISequence +
        "\nReload CO Sequence: " + reloadCOSequence +
        "\nAfter Reload Visits Used: " + Object.keys(afterReloadVisitStopMap).join(',')
    );
    */

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
    // FETCH PLANNED RETURN ITEMS
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

    let pendingCount = 0;

    if (!hasReloadRequest && (!deliveryItems || deliveryItems.length === 0)) {
        alert("No delivery items found");
        return true;
    }

    // ===============================
    // BUILD RETURN MAP
    //
    // NO RELOAD:
    //      old logic - all returns
    //
    // RELOAD:
    //      only returns after reload
    // ===============================
    const returnMap = {};

    if (returnItems && returnItems.length > 0) {

        for (let i = 0; i < returnItems.length; i++) {

            const item = getReadItem(returnItems, i);

            if (!item) {
                continue;
            }

            if (hasReloadRequest && !afterReloadVisitStopMap[item.StopUUID]) {
                continue;
            }

            const productID = item.ProductID;
            const qty = getSafeNumber(item.DeliveredQuantity);

            if (!productID) {
                continue;
            }

            if (!returnMap[productID]) {
                returnMap[productID] = 0;
            }

            returnMap[productID] += qty;
        }
    }

    // ===============================
    // BUILD UNPLANNED RETURN MAP
    //
    // NO RELOAD:
    //      old logic - all unplanned returns
    //
    // RELOAD:
    //      only unplanned returns after reload
    // ===============================
    const unplannedReturnMap = {};

    if (unplannedReturnItems && unplannedReturnItems.length > 0) {

        for (let i = 0; i < unplannedReturnItems.length; i++) {

            const item = getReadItem(unplannedReturnItems, i);

            if (!item) {
                continue;
            }

            if (hasReloadRequest && !afterReloadVisitStopMap[item.StopUUID]) {
                continue;
            }

            const productID = item.ProductID;
            const qty = getSafeNumber(item.DeliveredQuantity);

            if (!productID) {
                continue;
            }

            if (!unplannedReturnMap[productID]) {
                unplannedReturnMap[productID] = 0;
            }

            unplannedReturnMap[productID] += qty;
        }
    }

    // ===============================
    // PRODUCT MAP
    //
    // This map includes:
    // 1. Delivery products after reload
    // 2. Return-only products after reload
    // 3. RELOAD_CI products
    // 4. RELOAD_CO products
    // ===============================
    const productMap = {};

    // ===============================
    // DELIVERY MAP
    //
    // NO RELOAD:
    //      old logic - all delivery items
    //
    // RELOAD:
    //      only delivery items after reload
    // ===============================
    if (deliveryItems && deliveryItems.length > 0) {

        for (let i = 0; i < deliveryItems.length; i++) {

            const item = getReadItem(deliveryItems, i);

            if (!item) {
                continue;
            }

            if (hasReloadRequest && !afterReloadVisitStopMap[item.StopUUID]) {
                continue;
            }

            const productID = item.ProductID || "";
            const orderedUOM = item.OrderedUOM || getItemUOM(item);
            const productKey = productID + "::" + orderedUOM;

            if (!productID) {
                continue;
            }

            const ordered = getSafeNumber(item.OrderedQuantity);
            const delivered = getSafeNumber(item.DeliveredQuantity);

            if (!productMap[productKey]) {

                productMap[productKey] = {
                    ProductID: productID,
                    OrderedSum: ordered,
                    DeliveredSum: delivered,
                    OrderedUOM: orderedUOM,
                    RouteUUID: item.RouteUUID || routeUUID,
                    StopUUIDs: item.StopUUID ? [item.StopUUID] : []
                };

            } else {

                productMap[productKey].OrderedSum += ordered;
                productMap[productKey].DeliveredSum += delivered;

                if (item.StopUUID &&
                    !productMap[productKey].StopUUIDs.includes(item.StopUUID)) {
                    productMap[productKey].StopUUIDs.push(item.StopUUID);
                }
            }
        }
    }

    // ===============================
    // ADD UNPLANNED RETURN-ONLY PRODUCTS
    // ===============================
    if (unplannedReturnItems && unplannedReturnItems.length > 0) {

        for (let i = 0; i < unplannedReturnItems.length; i++) {

            const item = getReadItem(unplannedReturnItems, i);

            if (!item) {
                continue;
            }

            if (hasReloadRequest && !afterReloadVisitStopMap[item.StopUUID]) {
                continue;
            }

            const productID = item.ProductID || "";
            const orderedUOM = item.OrderedUOM || getItemUOM(item);

            addProductToMap(
                productMap,
                productID,
                orderedUOM,
                item.RouteUUID || routeUUID,
                item.StopUUID
            );
        }
    }

    // ===============================
    // ADD PLANNED RETURN-ONLY PRODUCTS
    // ===============================
    if (returnItems && returnItems.length > 0) {

        for (let i = 0; i < returnItems.length; i++) {

            const item = getReadItem(returnItems, i);

            if (!item) {
                continue;
            }

            if (hasReloadRequest && !afterReloadVisitStopMap[item.StopUUID]) {
                continue;
            }

            const productID = item.ProductID || "";
            const orderedUOM = item.OrderedUOM || getItemUOM(item);

            addProductToMap(
                productMap,
                productID,
                orderedUOM,
                item.RouteUUID || routeUUID,
                item.StopUUID
            );
        }
    }

    // ===============================
    // READ RELOAD_CI COCI PRODUCTS
    //
    // IMPORTANT:
    // This is main actual base for products recorded at Reload CheckIn.
    //
    // Remaining from Reload CI:
    //      ActualQuantity - UnloadedQuantity
    // ===============================
    const reloadCIRemainingMapByProductID = {};
    const reloadCIRemainingMapByKey = {};

    if (reloadCIStopUUID) {

        try {

            const reloadCIProducts = await clientAPI.read(
                '/LMD_MDKApp/Services/LMD_MA.service',
                'COCIProducts',
                [],
                `$filter=StopUUID eq guid'${reloadCIStopUUID}'`
            );

            if (reloadCIProducts && reloadCIProducts.length > 0) {

                for (let i = 0; i < reloadCIProducts.length; i++) {

                    const reloadCIItem = getReadItem(reloadCIProducts, i);

                    if (!reloadCIItem || !reloadCIItem.ProductID) {
                        continue;
                    }

                    const productID = reloadCIItem.ProductID;
                    const uom = getItemUOM(reloadCIItem);

                    const actualQty = getReloadCIActualQuantity(reloadCIItem);
                    const unloadedQty = getReloadCIUnloadedQuantity(reloadCIItem);

                    let remainingQty = actualQty - unloadedQty;

                    if (remainingQty < 0) {
                        remainingQty = 0;
                    }

                    const productKey = productID + "::" + uom;

                    if (!reloadCIRemainingMapByProductID[productID]) {
                        reloadCIRemainingMapByProductID[productID] = 0;
                    }

                    reloadCIRemainingMapByProductID[productID] += remainingQty;

                    if (!reloadCIRemainingMapByKey[productKey]) {
                        reloadCIRemainingMapByKey[productKey] = 0;
                    }

                    reloadCIRemainingMapByKey[productKey] += remainingQty;

                    // Add RELOAD_CI product also in productMap.
                    // If no delivery/return after reload also, it should still calculate.
                    addProductToMap(
                        productMap,
                        productID,
                        uom,
                        routeUUID,
                        reloadCIStopUUID
                    );
                }
            }

        } catch (e) {
            alert("Error reading RELOAD_CI COCIProducts: " + e);
        }
    }

    // ===============================
    // READ RELOAD_CO COCI PRODUCTS
    //
    // IMPORTANT:
    // These are registered / loaded products from reload checkout.
    // For reload flow, this is used instead of old Checkout actual.
    // ===============================
    const reloadCOActualMapByProductID = {};
    const reloadCOActualMapByKey = {};

    if (reloadCOStopUUID) {

        try {

            const reloadCOProducts = await clientAPI.read(
                '/LMD_MDKApp/Services/LMD_MA.service',
                'COCIProducts',
                [],
                `$filter=StopUUID eq guid'${reloadCOStopUUID}'`
            );

            if (reloadCOProducts && reloadCOProducts.length > 0) {

                for (let i = 0; i < reloadCOProducts.length; i++) {

                    const reloadCOItem = getReadItem(reloadCOProducts, i);

                    if (!reloadCOItem || !reloadCOItem.ProductID) {
                        continue;
                    }

                    const productID = reloadCOItem.ProductID;
                    const uom = getItemUOM(reloadCOItem);

                    const actualQty = getReloadCOActualQuantity(reloadCOItem);

                    const productKey = productID + "::" + uom;

                    if (!reloadCOActualMapByProductID[productID]) {
                        reloadCOActualMapByProductID[productID] = 0;
                    }

                    reloadCOActualMapByProductID[productID] += actualQty;

                    if (!reloadCOActualMapByKey[productKey]) {
                        reloadCOActualMapByKey[productKey] = 0;
                    }

                    reloadCOActualMapByKey[productKey] += actualQty;

                    // Add RELOAD_CO product also in productMap.
                    // This prevents only RELOAD_CI products coming.
                    addProductToMap(
                        productMap,
                        productID,
                        uom,
                        routeUUID,
                        reloadCOStopUUID
                    );
                }
            }

        } catch (e) {
            alert("Error reading RELOAD_CO COCIProducts: " + e);
        }
    }

    /*
    alert(
        "Before Final Calculation" +
        "\nProductMap Count: " + Object.keys(productMap).length +
        "\nReload CI Remaining By Product: " + JSON.stringify(reloadCIRemainingMapByProductID) +
        "\nReload CO Actual By Product: " + JSON.stringify(reloadCOActualMapByProductID) +
        "\nReturn Map: " + JSON.stringify(returnMap) +
        "\nUnplanned Return Map: " + JSON.stringify(unplannedReturnMap)
    );
    */

    // ===============================
    // CALCULATE FINAL ACTUAL
    // ===============================
    for (const key in productMap) {

        const product = productMap[key];

        let checkoutActual = 0;

        // ===============================
        // CHECKOUT ACTUAL
        //
        // Used only for NO RELOAD old flow.
        // For reload flow, do not use checkout actual.
        // ===============================
        if (!hasReloadRequest && checkoutStopUUID) {

            try {

                const cociResult = await clientAPI.read(
                    '/LMD_MDKApp/Services/LMD_MA.service',
                    'COCIProducts',
                    [],
                    `$filter=StopUUID eq guid'${checkoutStopUUID}' and ProductID eq '${product.ProductID}'`
                );

                if (cociResult && cociResult.length > 0) {

                    const cociItem = getReadItem(cociResult, 0);

                    checkoutActual = getSafeNumber(cociItem.ActualQuantity);
                }

            } catch (e) {
                checkoutActual = 0;
            }
        }

        const returnQty = returnMap[product.ProductID] || 0;
        const unplannedReturnQty = unplannedReturnMap[product.ProductID] || 0;

        // ===============================
        // OLD FORMULA
        //
        // Only for no reload.
        // This keeps your old flow untouched.
        // ===============================
        const oldFinalActual =
            checkoutActual +
            product.OrderedSum -
            product.DeliveredSum +
            returnQty +
            unplannedReturnQty;

        // ===============================
        // RELOAD CI REMAINING ACTUAL
        // ===============================
        const reloadCIRemainingByKey = reloadCIRemainingMapByKey[key] || 0;
        const reloadCIRemainingByProduct = reloadCIRemainingMapByProductID[product.ProductID] || 0;

        const reloadCIRemaining =
            reloadCIRemainingByKey || reloadCIRemainingByProduct || 0;

        // ===============================
        // RELOAD CO REGISTERED / LOADED ACTUAL
        // ===============================
        const reloadCOActualByKey = reloadCOActualMapByKey[key] || 0;
        const reloadCOActualByProduct = reloadCOActualMapByProductID[product.ProductID] || 0;

        const reloadCOActual =
            reloadCOActualByKey || reloadCOActualByProduct || 0;

        let finalActual = 0;

        let reloadBaseActual = 0;
        let orderedFallback = 0;

        if (hasReloadRequest) {

            // =================================================
            // RELOAD FLOW FINAL FORMULA - CORRECTED
            //
            // IMPORTANT:
            // If product has quantity from RELOAD_CI or RELOAD_CO,
            // do NOT add OrderedSum again.
            //
            // Example:
            // ReloadCI Actual = 25
            // ReloadCI Unloaded = 0
            // Delivered after reload visit = 20
            //
            // Correct:
            // 25 - 20 = 5
            //
            // Wrong old:
            // 25 + 25 - 20 = 30
            // =================================================

            reloadBaseActual =
                getSafeNumber(reloadCIRemaining) +
                getSafeNumber(reloadCOActual);

            // OrderedSum should be used only as fallback
            // when product is not present in RELOAD_CI / RELOAD_CO.
            orderedFallback =
                reloadBaseActual > 0
                    ? 0
                    : getSafeNumber(product.OrderedSum);

            finalActual =
                reloadBaseActual +
                orderedFallback -
                getSafeNumber(product.DeliveredSum) +
                getSafeNumber(returnQty) +
                getSafeNumber(unplannedReturnQty);

        } else {

            // =================================================
            // NO RELOAD FLOW
            //
            // Your old final checkin logic untouched.
            // =================================================
            finalActual = oldFinalActual;
        }

        /*
        alert(
            "Product Calculation" +
            "\nProduct: " + product.ProductID +
            "\nKey: " + key +
            "\nHas Reload: " + hasReloadRequest +
            "\nCheckout Actual Only No Reload: " + checkoutActual +
            "\nReload CI Remaining: " + reloadCIRemaining +
            "\nReload CO Actual: " + reloadCOActual +
            "\nReload Base Actual: " + reloadBaseActual +
            "\nOrdered After Reload: " + product.OrderedSum +
            "\nOrdered Fallback Used: " + orderedFallback +
            "\nDelivered After Reload: " + product.DeliveredSum +
            "\nReturn After Reload: " + returnQty +
            "\nUnplanned Return After Reload: " + unplannedReturnQty +
            "\nFinal Actual: " + finalActual
        );
        */

        if (finalActual > 0) {

            pendingCount++;

            appData.PendingProductList.push({
                ProductID: product.ProductID,
                ActualQuantity: finalActual,
                UnloadedQuantity: 0,
                ActualUOM: product.OrderedUOM,
                RouteUUID: product.RouteUUID || routeUUID,
                StopUUID: product.StopUUIDs && product.StopUUIDs.length > 0
                    ? product.StopUUIDs.join(',')
                    : ''
            });
        }
    }

    //alert(JSON.stringify(appData.PendingProductList, null, 2));

    // ===============================
    // FINALIZE
    // ===============================
    appData.StartButton = (pendingCount > 0);
    appData.PendingCount = pendingCount;

    clientAPI.getPageProxy().redraw();

    return true;
}