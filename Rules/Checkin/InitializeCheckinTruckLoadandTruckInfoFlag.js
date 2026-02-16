export default async function InitializeCheckinTruckLoadandTruckInfoFlag(clientAPI) {

    const appData = clientAPI.getAppClientData();

    //if (appData.CheckinTruckLoadConfirmed === undefined) appData.CheckinTruckLoadConfirmed = false;
    //if (appData.CheckinTruckInfoConfirmed === undefined) appData.CheckinTruckInfoConfirmed = false;
    //if (appData.CheckinCOCIPaymentConfirmed === undefined) appData.CheckinCOCIPaymentConfirmed = false;
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

    if (stopsResult && stopsResult.length > 0) {

        for (let i = 0; i < stopsResult.length; i++) {

            const stop = stopsResult.getItem(i);

            if (stop.StopType === 'CHECKOUT') {
                checkoutStopUUID = stop.StopUUID;
                break;
            }
        }
    }

    // ===============================
    // FETCH DELIVERY ITEMS (IsReturn = false)
    // ===============================
    const deliveryItems = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'DocumentItems',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}' and IsReturn eq false`
    );

    // ===============================
    // FETCH RETURN ITEMS (IsReturn = true)
    // ===============================
    const returnItems = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'DocumentItems',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}' and IsReturn eq true`
    );

    let pendingCount = 0;

    if (!deliveryItems || deliveryItems.length === 0) {
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
    // DELIVERY MAP
    // ===============================
    const productMap = {};

    // ===============================
    // LOOP DELIVERY ITEMS
    // ===============================
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

        // ===============================
        // ADD RETURN QTY
        // ===============================
        const returnQty = returnMap[product.ProductID] || 0;

        // ===============================
        // FINAL FORMULA
        // ===============================
        const finalActual =
            checkoutActual +
            product.OrderedSum -
            product.DeliveredSum +
            returnQty;

        // ===============================
        // DEBUG ALERT
        // ===============================
        //alert(
        //    "Product: " + product.ProductID +
        //    "\nCheckout: " + checkoutActual +
        //    "\nOrdered: " + product.OrderedSum +
        //    "\nDelivered: " + product.DeliveredSum +
        //    "\nReturned: " + returnQty +
        //    "\n------------------" +
        //    "\nFinal: " + finalActual
        //);

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