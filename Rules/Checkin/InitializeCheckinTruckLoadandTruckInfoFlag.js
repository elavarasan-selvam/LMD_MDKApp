export default async function InitializeCheckinTruckLoadandTruckInfoFlag(clientAPI) {
    const appData = clientAPI.getAppClientData();

    // Initialize flags
    if (appData.CheckinTruckLoadConfirmed === undefined) appData.CheckinTruckLoadConfirmed = false;
    if (appData.CheckinTruckInfoConfirmed === undefined) appData.CheckinTruckInfoConfirmed = false;

    // Reset pending product list
    appData.PendingProductList = [];

    // Store Stop and Route references
    const binding = clientAPI.getPageProxy().binding;

    if (binding && binding.StopUUID) {
        // Binding has Stop info
        appData.currentStop = binding;
        appData.currentRouteUUID = binding.RouteUUID;
        //alert(`CheckIn Page Loaded\nStopID: ${binding.StopID}\nStopUUID: ${binding.StopUUID}\nRouteUUID: ${binding.RouteUUID}`);
    } else if (binding && binding.StopID) {
        // Binding exists but StopUUID missing, fetch it
        const readStop = await clientAPI.read(
            '/LMD_MDKApp/Services/DEST_SAMLMD_PPROP.service',
            'Stops',
            [],
            `$filter=StopID eq '${binding.StopID}'`
        );

        if (readStop && readStop.length > 0) {
            const stopEntity = readStop.getItem ? readStop.getItem(0) : readStop[0];
            appData.currentStop = stopEntity;
            appData.currentRouteUUID = stopEntity.RouteUUID;
            //alert(`Stop fetched from backend\nStopID: ${stopEntity.StopID}\nStopUUID: ${stopEntity.StopUUID}\nRouteUUID: ${stopEntity.RouteUUID}`);
        } else {
            alert('Stop not found in backend for StopID: ' + binding.StopID);
        }
    } else {
        //alert('No binding found on CheckIn page!');
    }

    // Load DocumentItems for the Route
    const routeUUID = appData.currentRouteUUID;
    if (routeUUID) {
        //alert(`CheckIn Page Loaded\nRouteUUID: ${routeUUID}`);

        return clientAPI.read(
            '/LMD_MDKApp/Services/DEST_SAMLMD_PPROP.service',
            'DocumentItems',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}'`
        ).then(result => {
            let pendingCount = 0;

            if (result && result.length > 0) {
                alert(`Found ${result.length} DocumentItems`);

                for (let i = 0; i < result.length; i++) {
                    const item = result.getItem(i);
                    const ordered = Number(item.OrderedQuantity) || 0;
                    const delivered = Number(item.DeliveredQuantity) || 0;
                    const actual = ordered - delivered;
                    const uom = item.OrderedUOM || '';
                    const routeuuid = item.RouteUUID;
                    const stopuuid = item.StopUUID;

                    alert(`ProductID: ${item.ProductID}\nOrdered: ${ordered}\nDelivered: ${delivered}\nActual: ${actual}\nUOM: ${uom}`);

                    if (actual > 0) {
                        pendingCount++;
                        appData.PendingProductList.push({
                            ProductID: item.ProductID,
                            ActualQuantity: actual,
                            UnloadedQuantity: actual, // initially same as ActualQuantity
                            ActualUOM: uom,
                            RouteUUID: routeuuid,
                            StopUUID: stopuuid
                        });
                    }
                }
            } else {
                alert('No DocumentItems found for this Route');
            }

            appData.StartButton = (pendingCount > 0);
            appData.PendingCount = pendingCount;

            // Refresh UI
            clientAPI.getPageProxy().redraw();

            //alert(`Pending Products Stored Locally:\n${appData.PendingProductList.map(p => p.ProductID).join(', ')}`);

            return true;
        }).catch(error => {
            alert(`Error: ${error.message}`);
            return true;
        });
    }

    return true;
}
