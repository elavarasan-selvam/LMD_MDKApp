export default function IsStartButtonVisibleforTruckInfoofCheckin(context) {
    try {

        const appCD = context.getAppClientData();

        // Get current stop
        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return true; // show button if stop not found
        }

        const isConfirmed =
            appCD.CheckinTruckInfoConfirmedByStop?.[stopUUID] === true;

        // Show button only if NOT confirmed
        return !isConfirmed;

    } catch (e) {

        context.getLogger().error(
            "IsStartButtonVisibleforTruckInfoofCheckin error: " + e
        );

        return true; // safe fallback
    }
}
