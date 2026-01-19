export default async function BumpCompletedStops(context) {

    const appCD = context.getAppClientData();
    appCD.KPICompletedStops = (appCD.KPICompletedStops || 0) + 1;

    const stopRef = appCD.currentStop || context.binding;
    if (!stopRef || !stopRef.StopUUID) {
        alert("Stop reference missing");
        return;
    }

    const stopUUID = stopRef.StopUUID;
    const stopID = stopRef.StopID;

    const readResult = await context.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'Stops',
        [],
        `$filter=StopUUID eq guid'${stopUUID}'`
    );

    //alert("StopID: " + stopID + "\nStopUUID: " + stopUUID);

    if (!readResult || readResult.length === 0) {
        alert("Stop not found");
        return;
    }

    const stop = readResult.getItem(0);
    const stopReadLink = stop['@odata.readLink'];
    const currentDate = new Date().toISOString().split('.')[0];

    await context.executeAction({
        Name: "/LMD_MDKApp/Actions/Main/Stops/EndDateTime.action",
        Properties: {
            Target: { ReadLink: stopReadLink },
            Properties: { EndDateTime: currentDate }
        }
    });

    //alert("Stop " + stopID + " EndDateTime updated successfully.");

    await context.executeAction('/LMD_MDKApp/Actions/MyVisit/ReadDocumentUUID.action');

    return context.executeAction(
        "/LMD_MDKApp/Actions/StartMyVisit/CompleteVisit.action"
    );
}
