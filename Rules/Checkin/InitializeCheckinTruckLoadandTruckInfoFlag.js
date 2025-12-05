export default async function InitializeCheckinTruckLoadandTruckInfoFlag(clientAPI) {
    const appData = clientAPI.getAppClientData();

    if (appData.CheckinTruckLoadConfirmed === undefined) appData.CheckinTruckLoadConfirmed = false;
    if (appData.CheckinTruckInfoConfirmed === undefined) appData.CheckinTruckInfoConfirmed = false;

    appData.PendingProductList = [];

    const binding = clientAPI.getPageProxy().binding;

    if (binding && binding.StopUUID) {
        appData.currentStop = binding;
        appData.currentRouteUUID = binding.RouteUUID;
    } 
    else if (binding && binding.StopID) {
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
            alert("Stop fetched\nStopUUID: " + stopEntity.StopUUID);
        } else {
            alert("Stop not found");
        }
    }

    const routeUUID = appData.currentRouteUUID;
    if (!routeUUID) {
        alert("RouteUUID missing");
        return true;
    }

    // Fetch all stops for the route
    const stopsResult = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'Stops',
        [],
        "$filter=RouteUUID eq guid'" + routeUUID + "'"
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
    alert("Checkout StopUUID: " + checkoutStopUUID);

    // Fetch all document items for the route
    return clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'DocumentItems',
        [],
        "$filter=RouteUUID eq guid'" + routeUUID + "'"
    ).then(async result => {

        let pendingCount = 0;
        if (!result || result.length === 0) {
            alert("No DocumentItems Found");
            return true;
        }

        alert("DocumentItems Found: " + result.length);

        // Map to sum ordered and delivered per product
        const productMap = {};

        for (let i = 0; i < result.length; i++) {
            const item = result.getItem(i);
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

        // Loop through each product and calculate finalActual
        for (const key in productMap) {
            const product = productMap[key];

            let checkoutActual = 0;
            if (checkoutStopUUID) {
                try {
                    const cociResult = await clientAPI.read(
                        '/LMD_MDKApp/Services/LMD_MA.service',
                        'COCIProducts',
                        [],
                        "$filter=StopUUID eq guid'" + checkoutStopUUID + "' and ProductID eq '" + product.ProductID + "'"
                    );

                    if (cociResult && cociResult.length > 0) {
                        const cociItem = cociResult.getItem(0);
                        checkoutActual = Number(cociItem.ActualQuantity) || 0;
                    }
                } catch (e) {
                    alert("COCI read failed for Product: " + product.ProductID);
                    checkoutActual = 0;
                }
            }

            // finalActual = checkoutActual + orderedSum - deliveredSum
            const finalActual = checkoutActual + product.OrderedSum - product.DeliveredSum;

            alert(
                "Product: " + product.ProductID +
                "\nCheckout Actual: " + checkoutActual +
                "\nOrdered Sum: " + product.OrderedSum +
                "\nDelivered Sum: " + product.DeliveredSum +
                "\nFinal Actual: " + finalActual
            );

            if (finalActual > 0) {
                pendingCount++;
                appData.PendingProductList.push({
                    ProductID: product.ProductID,
                    ActualQuantity: finalActual,
                    UnloadedQuantity: "",
                    ActualUOM: product.OrderedUOM,
                    RouteUUID: product.RouteUUID,
                    StopUUID: product.StopUUIDs.join(',')
                });
            }
        }

        appData.StartButton = (pendingCount > 0);
        appData.PendingCount = pendingCount;
        alert("Pending Count: " + pendingCount);

        clientAPI.getPageProxy().redraw();
        return true;

    }).catch(error => {
        alert("Error: " + error.message);
        return true;
    });
}
