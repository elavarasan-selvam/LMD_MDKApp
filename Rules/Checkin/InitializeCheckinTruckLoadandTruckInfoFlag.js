export default async function InitializeCheckinTruckLoadandTruckInfoFlag(clientAPI) {

    const appData = clientAPI.getAppClientData();

    const ENABLE_DEBUG_ALERTS = true;

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
    // HELPER: NORMALIZE TEXT
    // ===============================
    function normalizeText(value) {
        if (value === undefined || value === null) {
            return "";
        }

        return String(value).trim().toUpperCase();
    }

    // ===============================
    // HELPER: GET PRODUCT ID SAFELY
    // ===============================
    function getItemProductID(item) {
        if (!item) {
            return "";
        }

        return (
            item.ProductID ||
            item.ProductId ||
            item.ProductNo ||
            item.ProductNumber ||
            item.Material ||
            item.MaterialNumber ||
            item.ItemProductID ||
            ""
        );
    }

    // ===============================
    // HELPER: NORMALIZED PRODUCT ID
    // ===============================
    function getNormalizedProductID(itemOrProductID) {
        if (typeof itemOrProductID === "object") {
            return normalizeText(getItemProductID(itemOrProductID));
        }

        return normalizeText(itemOrProductID);
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
    // HELPER: MAKE PRODUCT KEY
    // ===============================
    function makeProductKey(productID, uom) {
        return normalizeText(productID) + "::" + normalizeText(uom || "");
    }

    // ===============================
    // HELPER: RELOAD CI ACTUAL QTY
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
    // HELPER: CHECKOUT ACTUAL QTY
    // Used only for no reload flow
    // ===============================
    function getCheckoutActualQuantity(item) {
        return (
            getSafeNumber(item.ActualQuantity) ||
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

        const productKey = makeProductKey(productID, uom);

        if (!productMap[productKey]) {

            productMap[productKey] = {
                ProductID: productID,
                NormalizedProductID: normalizeText(productID),
                OrderedSum: 0,
                DeliveredSum: 0,
                OrderedUOM: uom || "",
                RouteUUID: routeUUID,
                StopUUIDs: stopUUID ? [stopUUID] : [],
                HasAfterReloadDelivery: false
            };

        } else {

            if (stopUUID && !productMap[productKey].StopUUIDs.includes(stopUUID)) {
                productMap[productKey].StopUUIDs.push(stopUUID);
            }
        }
    }

    // ===============================
    // HELPER: ADD QTY TO MAPS
    // ===============================
    function addQtyToMaps(mapByProductID, mapByKey, productID, uom, qty) {

        const normalizedProductID = normalizeText(productID);
        const productKey = makeProductKey(productID, uom);

        if (!normalizedProductID) {
            return;
        }

        if (!mapByProductID[normalizedProductID]) {
            mapByProductID[normalizedProductID] = 0;
        }

        mapByProductID[normalizedProductID] += getSafeNumber(qty);

        if (!mapByKey[productKey]) {
            mapByKey[productKey] = 0;
        }

        mapByKey[productKey] += getSafeNumber(qty);
    }

    // ===============================
    // HELPER: ADD RETURN QTY
    // ===============================
    function addReturnQty(map, productID, qty) {

        const normalizedProductID = normalizeText(productID);

        if (!normalizedProductID) {
            return;
        }

        if (!map[normalizedProductID]) {
            map[normalizedProductID] = 0;
        }

        map[normalizedProductID] += getSafeNumber(qty);
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

    /*if (ENABLE_DEBUG_ALERTS) {
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
    }*/

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

            const productID = getItemProductID(item);
            const qty = getSafeNumber(item.DeliveredQuantity);

            addReturnQty(returnMap, productID, qty);
        }
    }

    // ===============================
    // BUILD UNPLANNED RETURN MAP
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

            const productID = getItemProductID(item);
            const qty = getSafeNumber(item.DeliveredQuantity);

            addReturnQty(unplannedReturnMap, productID, qty);
        }
    }

    // ===============================
    // PRODUCT MAP
    // ===============================
    const productMap = {};

    // ===============================
    // DELIVERY MAP
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

            const productID = getItemProductID(item);
            const orderedUOM = item.OrderedUOM || getItemUOM(item);
            const productKey = makeProductKey(productID, orderedUOM);

            if (!productID) {
                continue;
            }

            const ordered = getSafeNumber(item.OrderedQuantity);
            const delivered = getSafeNumber(item.DeliveredQuantity);

            if (!productMap[productKey]) {

                productMap[productKey] = {
                    ProductID: productID,
                    NormalizedProductID: normalizeText(productID),
                    OrderedSum: ordered,
                    DeliveredSum: delivered,
                    OrderedUOM: orderedUOM,
                    RouteUUID: item.RouteUUID || routeUUID,
                    StopUUIDs: item.StopUUID ? [item.StopUUID] : [],
                    HasAfterReloadDelivery: hasReloadRequest
                };

            } else {

                productMap[productKey].OrderedSum += ordered;
                productMap[productKey].DeliveredSum += delivered;

                productMap[productKey].HasAfterReloadDelivery =
                    productMap[productKey].HasAfterReloadDelivery || hasReloadRequest;

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

            const productID = getItemProductID(item);
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

            const productID = getItemProductID(item);
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

                    if (!reloadCIItem) {
                        continue;
                    }

                    const productID = getItemProductID(reloadCIItem);

                    if (!productID) {
                        continue;
                    }

                    const uom = getItemUOM(reloadCIItem);

                    const actualQty = getReloadCIActualQuantity(reloadCIItem);
                    const unloadedQty = getReloadCIUnloadedQuantity(reloadCIItem);

                    let remainingQty = actualQty - unloadedQty;

                    if (remainingQty < 0) {
                        remainingQty = 0;
                    }

                    addQtyToMaps(
                        reloadCIRemainingMapByProductID,
                        reloadCIRemainingMapByKey,
                        productID,
                        uom,
                        remainingQty
                    );

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

                    if (!reloadCOItem) {
                        continue;
                    }

                    const productID = getItemProductID(reloadCOItem);

                    if (!productID) {
                        continue;
                    }

                    const uom = getItemUOM(reloadCOItem);
                    const actualQty = getReloadCOActualQuantity(reloadCOItem);

                    addQtyToMaps(
                        reloadCOActualMapByProductID,
                        reloadCOActualMapByKey,
                        productID,
                        uom,
                        actualQty
                    );

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

    /*if (ENABLE_DEBUG_ALERTS) {
        alert(
            "Before Final Calculation" +
            "\nProductMap Count: " + Object.keys(productMap).length +
            "\nReload CI Remaining By Product: " + JSON.stringify(reloadCIRemainingMapByProductID) +
            "\nReload CO Actual By Product: " + JSON.stringify(reloadCOActualMapByProductID) +
            "\nReturn Map: " + JSON.stringify(returnMap) +
            "\nUnplanned Return Map: " + JSON.stringify(unplannedReturnMap)
        );
    }*/

    // ===============================
    // CALCULATE FINAL ACTUAL
    // ===============================
    for (const key in productMap) {

        const product = productMap[key];

        const normalizedProductID =
            product.NormalizedProductID ||
            normalizeText(product.ProductID);

        let checkoutActual = 0;

        // ===============================
        // CHECKOUT ACTUAL
        // Used only for no reload old flow
        // ===============================
        if (!hasReloadRequest && checkoutStopUUID) {

            try {

                const cociResult = await clientAPI.read(
                    '/LMD_MDKApp/Services/LMD_MA.service',
                    'COCIProducts',
                    [],
                    `$filter=StopUUID eq guid'${checkoutStopUUID}'`
                );

                if (cociResult && cociResult.length > 0) {

                    for (let i = 0; i < cociResult.length; i++) {

                        const cociItem = getReadItem(cociResult, i);

                        if (!cociItem) {
                            continue;
                        }

                        const cociProductID = getItemProductID(cociItem);

                        if (normalizeText(cociProductID) !== normalizedProductID) {
                            continue;
                        }

                        checkoutActual += getCheckoutActualQuantity(cociItem);
                    }
                }

            } catch (e) {
                checkoutActual = 0;
            }
        }

        const returnQty = returnMap[normalizedProductID] || 0;
        const unplannedReturnQty = unplannedReturnMap[normalizedProductID] || 0;

        // ===============================
        // OLD FORMULA
        // Only for no reload
        // ===============================
        const oldFinalActual =
            checkoutActual +
            getSafeNumber(product.OrderedSum) -
            getSafeNumber(product.DeliveredSum) +
            getSafeNumber(returnQty) +
            getSafeNumber(unplannedReturnQty);

        // ===============================
        // RELOAD CI REMAINING ACTUAL
        // ===============================
        const reloadCIRemainingByKey = reloadCIRemainingMapByKey[key] || 0;
        const reloadCIRemainingByProduct = reloadCIRemainingMapByProductID[normalizedProductID] || 0;

        const reloadCIRemaining =
            getSafeNumber(reloadCIRemainingByKey) > 0
                ? getSafeNumber(reloadCIRemainingByKey)
                : getSafeNumber(reloadCIRemainingByProduct);

        // ===============================
        // RELOAD CO REGISTERED / LOADED ACTUAL
        // ===============================
        const reloadCOActualByKey = reloadCOActualMapByKey[key] || 0;
        const reloadCOActualByProduct = reloadCOActualMapByProductID[normalizedProductID] || 0;

        const reloadCOActual =
            getSafeNumber(reloadCOActualByKey) > 0
                ? getSafeNumber(reloadCOActualByKey)
                : getSafeNumber(reloadCOActualByProduct);

        let finalActual = 0;

        let reloadBaseActual = 0;
        let orderedFallback = 0;
        let afterReloadPendingDelivery = 0;

        if (hasReloadRequest) {

            // =================================================
            // RELOAD FLOW FINAL FORMULA
            //
            // IMPORTANT FIX:
            //
            // If product exists in RELOAD_CI / RELOAD_CO,
            // use reload base actual and subtract delivered after reload.
            //
            // Example CHOCO:
            // Reload checkin remaining = 22
            // Delivered after reload = 20
            // Final = 22 - 20 = 2
            //
            // If product does not exist in RELOAD_CI / RELOAD_CO,
            // use ordered after reload - delivered after reload.
            //
            // Example NUTS:
            // Ordered after reload = 10
            // Delivered after reload = 9
            // Final = 1
            //
            // Return-only products:
            // Example LMD unplanned return 4
            // Final = 4
            // =================================================

            reloadBaseActual =
                getSafeNumber(reloadCIRemaining) +
                getSafeNumber(reloadCOActual);

            afterReloadPendingDelivery =
                getSafeNumber(product.OrderedSum) -
                getSafeNumber(product.DeliveredSum);

            if (product.HasAfterReloadDelivery === true) {

                // =============================================
                // MAIN FIX IS HERE
                // If reload base exists, do not use ordered-delivered only.
                // Use reload base minus delivered after reload.
                // =============================================
                if (getSafeNumber(reloadBaseActual) > 0) {

                    finalActual =
                        getSafeNumber(reloadBaseActual) -
                        getSafeNumber(product.DeliveredSum) +
                        getSafeNumber(returnQty) +
                        getSafeNumber(unplannedReturnQty);

                } else {

                    finalActual =
                        getSafeNumber(product.OrderedSum) -
                        getSafeNumber(product.DeliveredSum) +
                        getSafeNumber(returnQty) +
                        getSafeNumber(unplannedReturnQty);
                }

            } else {

                orderedFallback =
                    getSafeNumber(reloadBaseActual) > 0
                        ? 0
                        : getSafeNumber(product.OrderedSum);

                finalActual =
                    getSafeNumber(reloadBaseActual) +
                    getSafeNumber(orderedFallback) +
                    getSafeNumber(returnQty) +
                    getSafeNumber(unplannedReturnQty);
            }

            if (finalActual < 0) {
                finalActual = 0;
            }

        } else {

            // =================================================
            // NO RELOAD FLOW
            // Old final checkin logic untouched
            // =================================================
            finalActual = oldFinalActual;
        }

        /*if (ENABLE_DEBUG_ALERTS) {
            alert(
                "Product Calculation" +
                "\nProduct: " + product.ProductID +
                "\nNormalized Product: " + normalizedProductID +
                "\nKey: " + key +
                "\nHas Reload: " + hasReloadRequest +
                "\nHas After Reload Delivery: " + product.HasAfterReloadDelivery +
                "\nCheckout Actual Only No Reload: " + checkoutActual +
                "\nReload CI Remaining By Key: " + reloadCIRemainingByKey +
                "\nReload CI Remaining By Product: " + reloadCIRemainingByProduct +
                "\nReload CI Remaining Used: " + reloadCIRemaining +
                "\nReload CO Actual By Key: " + reloadCOActualByKey +
                "\nReload CO Actual By Product: " + reloadCOActualByProduct +
                "\nReload CO Actual Used: " + reloadCOActual +
                "\nReload Base Actual: " + reloadBaseActual +
                "\nOrdered After Reload: " + product.OrderedSum +
                "\nDelivered After Reload: " + product.DeliveredSum +
                "\nAfter Reload Pending Delivery: " + afterReloadPendingDelivery +
                "\nOrdered Fallback Used: " + orderedFallback +
                "\nReturn After Reload: " + returnQty +
                "\nUnplanned Return After Reload: " + unplannedReturnQty +
                "\nFinal Actual: " + finalActual
            );
        }*/

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

    /*if (ENABLE_DEBUG_ALERTS) {
        alert(
            "FINAL PENDING LIST" +
            "\nPending Count: " + pendingCount +
            "\nPending Product List: " + JSON.stringify(appData.PendingProductList, null, 2)
        );
    }*/

    // ===============================
    // FINALIZE
    // ===============================
    appData.StartButton = (pendingCount > 0);
    appData.PendingCount = pendingCount;

    clientAPI.getPageProxy().redraw();

    return true;
}