/**
 * Return VISIT StopUUID value
 * @param {IClientAPI} context
 */
export default function GetCurrentVisitStopUUID(context) {
    try {
        const appCD = context.getAppClientData();
        const stopRef = appCD.currentStop || context.binding;

        if (!stopRef || !stopRef.StopUUID) {
            alert("StopUUID not found for Collection");
            return "";
        }

        //alert("Returning StopUUID: " + stopRef.StopUUID);
        return stopRef.StopUUID;

    } catch (err) {
        //alert("Error in GetCurrentVisitStopUUID: " + err.message);
        return "";
    }
}
