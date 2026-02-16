export default function IsStartButtonVisibleforTruckInfo(context) {
    try {

        const appCD = context.getAppClientData();

        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return true;
        }

        const isConfirmed =
            appCD.TruckInfoConfirmedByStop?.[stopUUID] === true;

        // Show only if NOT confirmed
        return !isConfirmed;

    } catch (e) {

        context.getLogger().error(
            "IsStartButtonVisibleforTruckInfo error: " + e
        );

        return true;
    }
}
