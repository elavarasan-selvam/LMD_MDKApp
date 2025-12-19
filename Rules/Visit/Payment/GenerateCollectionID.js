/**
 * Generate CollectionID using current stop
 * Max length 10
 * @param {IClientAPI} clientAPI
 */
export default function GenerateCollectionID(clientAPI) {

    const appCD = clientAPI.getAppClientData();
    const stopRef = appCD.currentStop || clientAPI.getPageProxy().binding;

    if (!stopRef || !stopRef.StopUUID) {
        alert("StopUUID not found for CollectionID");
        return "";
    }

    // Remove hyphens
    const stopUUID = stopRef.StopUUID.replace(/-/g, "");

    // COL + last 7 chars = 10 chars
    const collectionID = "COL" + stopUUID.slice(-7);

    alert("Generated CollectionID: " + collectionID);
    return collectionID;
}
