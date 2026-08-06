export default function GetStopUUID(context) {
     const appCD = context.getAppClientData();
    const currentStop =
        appCD.currentStop ||
        context.getPageProxy().binding ||
        context.binding;
    if (!currentStop?.StopUUID || !currentStop?.RouteUUID) {
        return [];
    }
    const stopUUID = currentStop.StopUUID;
    alert(`StopUUID: ${stopUUID}`);
    return stopUUID;
}