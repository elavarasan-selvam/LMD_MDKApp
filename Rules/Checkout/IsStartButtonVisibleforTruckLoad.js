export default function IsStartButtonVisibleforTruckLoad(context) {
    try {

        const appCD = context.getAppClientData();

        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return true;
        }

        const isConfirmed =
            appCD.TruckLoadConfirmedByStop?.[stopUUID] === true;

        // Show only if NOT confirmed
        return !isConfirmed;

    } catch (e) {

        context.getLogger().error(
            "IsStartButtonVisibleforTruckLoad error: " + e
        );

        return true;
    }
}
