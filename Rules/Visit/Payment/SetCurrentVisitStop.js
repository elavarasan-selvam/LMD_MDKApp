/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function SetCurrentVisitStop(clientAPI) {

    const pageProxy = clientAPI.getPageProxy();

    // Always get CURRENT visit binding
    const visit = pageProxy.binding;

    if (!visit || !visit.StopUUID) {
        alert("Visit StopUUID missing");
        return;
    }

    alert(
        "Payment will be created for:\n" +
        "StopUUID: " + visit.StopUUID
    );

    // Store explicitly
    const appCD = clientAPI.getAppClientData();
    appCD.CurrentPaymentStopUUID = visit.StopUUID;

    // Now create payment
    return clientAPI.executeAction(
        "/LMD_MDKApp/Actions/MyVisit/Payment/Collection_Creation.action"
    );
}
