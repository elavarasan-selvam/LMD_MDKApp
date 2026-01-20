

export default async function InitializeDeliveryandReturnFlag(context) {
    const appCD = context.getAppClientData();

    // Existing flags (leave them if used elsewhere)
    if (appCD.TruckDeliveryConfirmed === undefined) appCD.TruckDeliveryConfirmed = false;
    if (appCD.TruckReturnConfirmed === undefined) appCD.TruckReturnConfirmed = false;

    // ADD: per-stop maps
    if (!appCD.DeliveryConfirmedByStop) appCD.DeliveryConfirmedByStop = {};
    if (!appCD.ReturnConfirmedByStop) appCD.ReturnConfirmedByStop = {};
    if (!appCD.PODConfirmedByStop) appCD.PODConfirmedByStop = {};


    const binding = context.binding;
    if (!binding || !binding.StopUUID) {
        const readStops = await context.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            `$filter=StopID eq '${binding.StopID}'`
        );

        if (readStops && readStops.length > 0) {
            appCD.currentStop = readStops.getItem(0);
        }
    } else {
        appCD.currentStop = binding;
    }

    context.getPageProxy().redraw();
    return true;
}
