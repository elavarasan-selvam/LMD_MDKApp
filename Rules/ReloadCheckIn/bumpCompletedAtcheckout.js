/**
 * @param {IClientAPI} clientAPI
 */
export default async function bumpCompletedAtcheckout(clientAPI) {

    const pageProxy = clientAPI.getPageProxy();

    // Always use the page binding
    const stopRef = pageProxy.binding;

    if (!stopRef || !stopRef.StopUUID) {
        alert("Stop reference missing");
        return;
    }

    //alert("Page Binding StopType: " + stopRef.StopType);
    //alert("Page Binding StopUUID: " + stopRef.StopUUID);

    const stopUUID = stopRef.StopUUID;

    const readResult = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'Stops',
        [],
        `$filter=StopUUID eq guid'${stopUUID}'`
    );

    if (!readResult || readResult.length === 0) {
        alert("Stop not found");
        return;
    }

    const stop = readResult.getItem(0);
    const stopReadLink = stop['@odata.readLink'];

    const reloadcurrentDate = new Date().toISOString();

    //alert("ReadLink: " + stopReadLink);
    //alert("Updating EndDateTime: " + reloadcurrentDate);

    await clientAPI.executeAction({
        Name: "/LMD_MDKApp/Actions/ReloadCheckout/ReloadEndDateTime.action",
        Properties: {
            Target: {
                ReadLink: stopReadLink
            },
            Properties: {
                EndDateTime: reloadcurrentDate
            }
        }
    });

    //alert("EndDateTime updated successfully");

    // Verify immediately
    /*const verify = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        stopReadLink,
        [],
        ''
    );*/

    //alert("EndDateTime after update: " + verify.getItem(0).EndDateTime);

    // Uncomment once verified
     return clientAPI.executeAction("/LMD_MDKApp/Actions/StartCheckout/CompleteCheckout.action");
}