export default function GetReturnStatus(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    if (stopUUID && appCD.ReturnConfirmedByStop?.[stopUUID]) {
        return "Done";
    }
    return "Open";
}
