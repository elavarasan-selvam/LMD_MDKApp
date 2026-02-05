export default function IsReturnActionVisible(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    // Safe default → show buttons
    if (!stopUUID) {
        return true;
    }

    // Hide BOTH Start & Confirm once return is confirmed
    return appCD.ReturnConfirmedByStop?.[stopUUID] !== true;
}
