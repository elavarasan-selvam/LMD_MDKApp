export default function GetPODStatus(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    if (stopUUID && appCD.PODConfirmedByStop?.[stopUUID]) {
        return "Done";
    }
    return "Open";
}
