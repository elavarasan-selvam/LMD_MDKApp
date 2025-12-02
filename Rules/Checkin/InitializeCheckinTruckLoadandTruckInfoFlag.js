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
        appData.currentStop = binding;
        appData.currentRouteUUID = binding.RouteUUID;
    } else if (binding && binding.StopID) {
        const readStop = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            `$filter=StopID eq '${binding.StopID}'`
        );

        if (readStop && readStop.length > 0) {
            const stopEntity = readStop.getItem ? readStop.getItem(0) : readStop[0];
            appData.currentStop = stopEntity;
            appData.currentRouteUUID = stopEntity.RouteUUID;
            alert(`Stop fetched from backend\nStopID: ${stopEntity.StopID}\nStopUUID: ${stopEntity.StopUUID}\nRouteUUID: ${stopEntity.RouteUUID}`);
        } else {
            alert('Stop not found in backend for StopID: ' + binding.StopID);
        }
    }

    const routeUUID = appData.currentRouteUUID;
    if (routeUUID) {
        // Step 1: Read all stops for this route
        const stopsResult = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}'`
        );

        let checkoutStopUUID = null;

        if (stopsResult && stopsResult.length > 0) {
            for (let i = 0; i < stopsResult.length; i++) {
                const stop = stopsResult.getItem ? stopsResult.getItem(i) : stopsResult[i];
                if (stop.StopType === 'CHECKOUT') {
                    checkoutStopUUID = stop.StopUUID;
                    break;
                }
            }
        }

        return clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'DocumentItems',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}'`
        ).then(async result => {
            let pendingCount = 0;

            if (result && result.length > 0) {
                alert(`Found ${result.length} DocumentItems`);

                for (let i = 0; i < result.length; i++) {
                    const item = result.getItem ? result.getItem(i) : result[i];
                    const ordered = Number(item.OrderedQuantity) || 0;
                    const delivered = Number(item.DeliveredQuantity) || 0;
                    const uom = item.OrderedUOM || '';
                    const routeuuid = item.RouteUUID;
                    const stopuuid = item.StopUUID;

                    // Default actual
                    let actual = ordered - delivered;
                    let cociActual = null;

                    // Step 2: Read COCIProducts for CHECKOUT stop
                    if (checkoutStopUUID) {
                        try {
                            const cociResult = await clientAPI.read(
                                '/LMD_MDKApp/Services/LMD_MA.service',
                                'COCIProducts',
                                [],
                                `$filter=StopUUID eq guid'${checkoutStopUUID}' and ProductID eq '${item.ProductID}'`
                            );

                            if (cociResult && cociResult.length > 0) {
                                const cociItem = cociResult.getItem ? cociResult.getItem(0) : cociResult[0];
                                cociActual = cociItem.ActualQuantity;
                                if (cociItem.ActualQuantity !== undefined && cociItem.ActualQuantity !== null) {
                                    actual = Number(cociItem.ActualQuantity) - delivered;
                                }
                            }
                        } catch (err) {
                            // fallback remains ordered - delivered
                        }
                    }

                    alert(`ProductID: ${item.ProductID}\nOrdered: ${ordered}\nDelivered: ${delivered}\nCOCI ActualQuantity: ${cociActual}\nFinal ActualQuantityUsed: ${actual}\nUOM: ${uom}`);

                    if (actual > 0) {
                        pendingCount++;
                        appData.PendingProductList.push({
                            ProductID: item.ProductID,
                            ActualQuantity: actual,
                            UnloadedQuantity: null,
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

            clientAPI.getPageProxy().redraw();
            return true;
        }).catch(error => {
            alert(`Error: ${error.message}`);
            return true;
        });
    }

    return true;
}
