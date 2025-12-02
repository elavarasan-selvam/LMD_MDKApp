export default async function BumpCompletedStops(context) {
    const appCD = context.getAppClientData();
    appCD.KPICompletedStops = (appCD.KPICompletedStops || 0) + 1;

    const stopRef = appCD.currentStop || context.binding;
    if (!stopRef || !stopRef.StopUUID) {
        alert("Stop reference missing or StopUUID undefined, cannot proceed.");
        return;
    }

    const stopUUID = stopRef.StopUUID;
    const stopID = stopRef.StopID;

    // Log Stop info
    alert("StopID: " + stopID + "\nStopUUID: " + stopUUID);

    // Step 1: Read Stop entity
    const readResult = await context.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'Stops',
        [],
        `$filter=StopUUID eq guid'${stopUUID}'`
    );

    if (!readResult || readResult.length === 0) {
        alert("Stop not found for UUID: " + stopUUID);
        return;
    }

    const stop = readResult.getItem ? readResult.getItem(0) : readResult[0];
    const stopReadLink = stop['@odata.readLink'];
    const currentDate = new Date().toISOString().split('.')[0];

    // Log StopType
    alert("StopType: " + stop.StopType);

    // Step 2: Update Stop EndDateTime
    alert("Updating Stop EndDateTime for StopID: " + stopID + " to " + currentDate);
    await context.executeAction({
        Name: "/LMD_MDKApp/Actions/Main/Stops/EndDateTime.action",
        Properties: {
            Target: { ReadLink: stopReadLink },
            Properties: { EndDateTime: currentDate }
        }
    });
    alert("Stop " + stopID + " EndDateTime updated successfully.");

    // Step 3: Update Document DeliveryDate only for StopType = "VISIT"
    if (stop.StopType === "VISIT") {
        alert("StopType VISIT detected, reading DocumentItems for StopUUID...");
        await context.executeAction('/LMD_MDKApp/Actions/MyVisit/ReadDocumentUUID.action');
        alert('Updated doc date');
    }

    // Step 4: Continue with CompleteCheckout action
    return context.executeAction("/LMD_MDKApp/Actions/StartCheckout/CompleteCheckout.action");
}
