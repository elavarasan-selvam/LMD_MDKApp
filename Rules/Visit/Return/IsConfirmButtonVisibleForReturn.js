export default function IsConfirmButtonVisibleForReturn(context) {
    try {
        const appCD = context.getAppClientData();
        const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return true; // safe default: show Confirm
        }

        // Show Confirm ONLY if return is NOT yet confirmed for this visit
        return appCD.ReturnConfirmedByStop?.[stopUUID] !== true;

    } catch (e) {
        context.getLogger().error("IsConfirmButtonVisibleForReturn error: " + e);
        return true;
    }
}
