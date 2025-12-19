/**
 * Return VISIT Stop ReadLink for Collections
 * @param {IClientAPI} context
 */
export default function Collection_VisitPaymentReadLink(context) {
    try {
        const appCD = context.getAppClientData();
        const stopRef = appCD.currentStop || context.binding;
        if (!stopRef || !stopRef.StopUUID) {
            return "";
        }

        const stopUUID = stopRef.StopUUID;

        // Build Stop ReadLink
        const stopReadLink = `Stops(guid'${stopUUID}')`;

        alert(`Generated Stop ReadLink: ${stopReadLink}`);

        // Return Stop ReadLink (used as ParentReadLink for Collections)
        return stopReadLink;

    } catch (err) {
        alert('Error in COCI_VisitPaymentReadLink: ' + err.message);
        return "";
    }
}
