/**
 * Store products locally with ActualQuantity, UnloadedQuantity, ActualUOM
 * @param {IClientAPI} clientAPI
 */
export default function UpdatingTruckLoad(clientAPI) {
    const appData = clientAPI.getAppClientData();
    appData.PendingProductList = []; // Reset the local list

    const binding = clientAPI.getPageProxy().binding;
    const routeUUID = binding.RouteUUID;

    //alert(`CheckIn Page Loaded\nRouteUUID: ${routeUUID}`);

    // Read DocumentItems for this Route
    return clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'DocumentItems',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}'`
    ).then(result => {
        if (result && result.length > 0) {
            //alert(`Found ${result.length} DocumentItems`);

            for (let i = 0; i < result.length; i++) {
                const item = result.getItem(i);
                const ordered = item.OrderedQuantity || 0;
                const delivered = item.DeliveredQuantity || 0;
                const actual = ordered - delivered;
                const uom = item.OrderedUOM || '';

                //alert(`ProductID: ${item.ProductID}\nOrdered: ${ordered}\nDelivered: ${delivered}\nActual: ${actual}\nUOM: ${uom}`);

                if (actual > 0) {
                    // Store locally
                    appData.PendingProductList.push({
                        ProductID: item.ProductID,
                        ActualQuantity: actual,
                        UnloadedQuantity: actual, // initially same as ActualQuantity
                        ActualUOM: uom
                    });
                }
            }
        } else {
            //alert('No DocumentItems found for this Route');
        }

        //alert(`Pending Products Stored Locally: ${appData.PendingProductList.map(p => p.ProductID).join(', ')}`);
        return true;
    }).catch(error => {
        alert(`Error: ${error.message}`);
        return true;
    });
}
