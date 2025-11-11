export default async function InitializeDeliveryandReturnFlag(context) {
    const appCD = context.getAppClientData();

    if (appCD.TruckDeliveryConfirmed === undefined) appCD.TruckDeliveryConfirmed = false;
    if (appCD.TruckReturnConfirmed === undefined) appCD.TruckReturnConfirmed = false;

    const binding = context.binding;
    if (!binding || !binding.StopUUID) {
        //alert("Visit page has no StopUUID in binding, fetching it...");
        const readStops = await context.read(
            '/LMD_MDKApp/Services/DEST_SAMLMD_PPROP.service',
            'Stops',
            [],
            `$filter=StopID eq '${binding.StopID}'`
        );

        if (readStops && readStops.length > 0) {
            const stopEntity = readStops.getItem ? readStops.getItem(0) : readStops[0];
            appCD.currentStop = stopEntity;
            //alert("Fetched Stop for Visit: " + stopEntity.StopID);
        } else {
            alert("No Stop found for StopID: " + binding.StopID);
        }
    } else {
        appCD.currentStop = binding;
        //alert("Visit Stop reference set: " + binding.StopID);
    }

    return true;
}
