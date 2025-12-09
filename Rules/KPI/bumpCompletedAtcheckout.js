/**
 * @param {IClientAPI} clientAPI
 */
export default async function bumpCompletedAtcheckout(clientAPI) {

    const appCD = clientAPI.getAppClientData();
    appCD.KPICompletedStops = (appCD.KPICompletedStops || 0) + 1;

    const stopRef = appCD.currentStop || clientAPI.binding;
    if (!stopRef || !stopRef.StopUUID) {
        alert("Stop reference missing");
        return;
    }

    const stopUUID = stopRef.StopUUID;

    const readResult = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'Stops',
        [],
        `$filter=StopUUID eq guid'${stopUUID}'`
    );

    //alert("StopUUID read: " + stopUUID);

    if (!readResult || readResult.length === 0) {
        alert("Stop not found");
        return;
    }

    const stop = readResult.getItem(0);
    const stopReadLink = stop['@odata.readLink'];

    const currentDate = new Date().toISOString().split('.')[0];

    await clientAPI.executeAction({
        Name: "/LMD_MDKApp/Actions/Main/Stops/EndDateTime.action",
        Properties: {
            Target: { ReadLink: stopReadLink },
            Properties: { EndDateTime: currentDate }
        }
    });

    //alert("Stop EndDateTime updated");

    return clientAPI.executeAction(
        "/LMD_MDKApp/Actions/StartCheckout/CompleteCheckout.action"
    );
}
