/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function UnplannedReturnDocItemCreationStopUUID(context) {
     const appCD = context.getAppClientData();
    const currentStop =
        appCD.currentStop ||
        context.getPageProxy().binding ||
        context.binding;
    if (!currentStop?.StopUUID || !currentStop?.RouteUUID) {
        return [];
    }
    const stopUUID = currentStop.StopUUID;
    return stopUUID;
}
