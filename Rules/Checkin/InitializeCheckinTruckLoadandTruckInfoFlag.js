export default function InitializeCheckinTruckLoadandTruckInfoFlag(clientAPI) {
    const appData = clientAPI.getAppClientData();

    // 1️⃣ Initialize flags if not already defined
    if (appData.CheckinTruckLoadConfirmed === undefined) {
        appData.CheckinTruckLoadConfirmed = false;
    }
    if (appData.CheckinTruckInfoConfirmed === undefined) {
        appData.CheckinTruckInfoConfirmed = false;
    }

    // 2️⃣ Reset local list for pending products
    appData.PendingProductList = [];

    // 3️⃣ Store Stop and Route references for later use
    const binding = clientAPI.getPageProxy().binding;
    if (binding) {
        appData.currentStop = binding;  // store Stop reference
        if (binding.RouteUUID) {
            appData.currentRouteUUID = binding.RouteUUID; // store Route UUID
        }
    }

    const routeUUID = binding ? binding.RouteUUID : null;
    alert(`CheckIn Page Loaded\nRouteUUID: ${routeUUID}`);

    // 4️⃣ Read DocumentItems for this Route
    return clientAPI.read(
        '/LMD_MDKApp/Services/DEST_SAMSMA_PPROP.service',
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
                    // Store locally
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

        // Redraw the page so UI reflects changes
        clientAPI.getPageProxy().redraw();

        alert(`Pending Products Stored Locally:\n${appData.PendingProductList.map(p => p.ProductID).join(', ')}`);

        return true;
    }).catch(error => {
        alert(`Error: ${error.message}`);
        return true;
    });
}
