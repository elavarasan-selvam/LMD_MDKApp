export default async function InitializeReloadCheckIn(clientAPI) {

    const appData = clientAPI.getAppClientData();

    appData.ReloadPendingProductList = [];

    const binding = clientAPI.getPageProxy().binding;

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

    // ===============================
    // FINALIZE
    // ===============================
    appData.StartButton = (reloadPendingCount > 0);
    appData.ReloadPendingCount = reloadPendingCount;

    clientAPI.getPageProxy().redraw();

    return true;
}