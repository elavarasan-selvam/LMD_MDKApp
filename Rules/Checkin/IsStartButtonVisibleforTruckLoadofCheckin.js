export default function IsStartButtonVisibleforTruckLoadofCheckin(context) {
    try {

        const appCD = context.getAppClientData();

        // Get current stop
        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return true; // Show button if stop not found
        }

        const isConfirmed =
            appCD.CheckinTruckLoadConfirmedByStop?.[stopUUID] === true;

        // Show Start only if NOT confirmed
        return !isConfirmed;

    } catch (e) {

        context.getLogger().error(
            "IsStartButtonVisibleforTruckLoadofCheckin error: " + e
        );

        return true; // safe fallback
    }
}
