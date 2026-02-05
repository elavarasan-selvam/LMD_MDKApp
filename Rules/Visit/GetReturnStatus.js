export default function GetReturnStatus(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    return (stopUUID && appCD.ReturnConfirmedByStop?.[stopUUID])
        ? "Done"
        : "Open";
}
