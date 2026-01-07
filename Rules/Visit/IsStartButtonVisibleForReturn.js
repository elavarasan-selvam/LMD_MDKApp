export default function IsStartButtonVisibleForReturn(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    return !(stopUUID && appCD.ReturnConfirmedByStop?.[stopUUID]);
}
