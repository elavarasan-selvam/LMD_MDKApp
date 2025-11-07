export default async function BumpCompletedStops(context) {
    const appCD = context.getAppClientData();
    // Increment KPI counter
    appCD.KPICompletedStops = (appCD.KPICompletedStops || 0) + 1;

    // Get Stop reference from AppClientData or current binding
    const stopRef = appCD.currentStop || context.binding;
    //const stopRef = appCD.currentCheckoutStop || appCD.currentVisitStop || context.binding;

    if (!stopRef || !stopRef.StopUUID) {
        alert('Stop reference missing or StopUUID undefined.');
        return;
    }

    const stopUUID = stopRef.StopUUID;
    //alert('Reloading Stop for UUID: ' + stopUUID);

    // Step 1: Read Stop freshly
    const readResult = await context.read(
        '/LMD_MDKApp/Services/DEST_SAMSMA_PPROP.service',
        'Stops',
        [],
        `$filter=StopUUID eq guid'${stopUUID}'`
    );

    if (!readResult || readResult.length === 0) {
        alert('Stop not found for UUID: ' + stopUUID);
        return;
    }

    //alert('Stop found for UUID: ' + stopUUID);

    // Support MDK readResult with getItem() or array
    let stop;
    if (typeof readResult.getItem === 'function') {
        stop = readResult.getItem(0);
    } else if (Array.isArray(readResult)) {
        stop = readResult[0];
    } else if (readResult.data && Array.isArray(readResult.data)) {
        stop = readResult.data[0];
    } else {
        stop = readResult; // fallback
    }

    const stopReadLink = stop['@odata.readLink'] || `Stops(guid'${stopUUID}')`;
    const currentDate = new Date().toISOString().split('.')[0];
    const stopID = stop.StopID || 'Unknown Stop';

    //alert('Updating Stop EndDateTime for: ' + stopID + ' to ' + currentDate);

    // Step 2: Update with fresh readLink
    await context.executeAction({
        "Name": "/LMD_MDKApp/Actions/Main/Stops/EndDateTime.action",
        "Properties": {
            "Target": { "ReadLink": stopReadLink },
            "Properties": { "EndDateTime": currentDate }
        }
    });
    // Continue with next actions
    return context.executeAction("/LMD_MDKApp/Actions/StartCheckout/CompleteCheckout.action");
}
