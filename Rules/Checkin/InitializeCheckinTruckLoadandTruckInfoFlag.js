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

    return clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'DocumentItems',
        [],
        "$filter=RouteUUID eq guid'" + routeUUID + "'"
    ).then(async result => {

        let pendingCount = 0;

        if (result && result.length > 0) {

            alert("DocumentItems Found: " + result.length);

            for (let i = 0; i < result.length; i++) {
                const item = result.getItem(i);

                const ordered = Number(item.OrderedQuantity) || 0;
                const delivered = Number(item.DeliveredQuantity) || 0;
                const uom = item.OrderedUOM || '';
                const routeuuid = item.RouteUUID;
                const stopuuid = item.StopUUID;

                let actual = 0;

                if (checkoutStopUUID) {
                    try {
                        const cociResult = await clientAPI.read(
                            '/LMD_MDKApp/Services/LMD_MA.service',
                            'COCIProducts',
                            [],
                            "$filter=StopUUID eq guid'" + checkoutStopUUID + "' and ProductID eq '" + item.ProductID + "'"
                        );

                        if (cociResult && cociResult.length > 0) {
                            const cociItem = cociResult.getItem(0);
                            actual = Number(cociItem.ActualQuantity) || 0;
                        }
                    } catch (e) {
                        alert("COCI read failed for Product: " + item.ProductID);
                        actual = 0;
                    }
                }

                const beforeCalc = actual;

                actual = actual + ordered;
                actual = actual - delivered;

                alert(
                    "Product: " + item.ProductID +
                    "\nCOCI Actual: " + beforeCalc +
                    "\nOrdered: " + ordered +
                    "\nDelivered: " + delivered +
                    "\nFinal Actual: " + actual
                );

                if (actual > 0) {
                    pendingCount++;
                    appData.PendingProductList.push({
                        ProductID: item.ProductID,
                        ActualQuantity: actual,
                        UnloadedQuantity: "",
                        ActualUOM: uom,
                        RouteUUID: routeuuid,
                        StopUUID: stopuuid
                    });
                }
            }
        } else {
            alert("No DocumentItems Found");
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
