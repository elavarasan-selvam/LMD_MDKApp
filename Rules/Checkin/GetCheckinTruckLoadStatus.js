export default function GetCheckinTruckLoadStatus(context) {
    try {

        const appCD = context.getAppClientData();

        // Get current stop
        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return "Open"; // default
        }

        const isConfirmed =
            appCD.CheckinTruckLoadConfirmedByStop?.[stopUUID] === true;

        return isConfirmed ? "Done" : "Open";

    } catch (e) {

        context.getLogger().error(
            "GetCheckinTruckLoadStatus error: " + e
        );

        return "Open"; // safe fallback
    }
}
