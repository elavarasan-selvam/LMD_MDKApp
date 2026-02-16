export default function GetCheckinTruckInfoStatus(context) {
    try {

        const appCD = context.getAppClientData();

        // Get current stop
        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return "Open";
        }

        const isConfirmed =
            appCD.CheckinTruckInfoConfirmedByStop?.[stopUUID] === true;

        if (isConfirmed) {
            return "Done";   // completed for this stop
        }

        return "Open";       // not yet completed

    } catch (e) {

        context.getLogger().error(
            "GetCheckinTruckInfoStatus error: " + e
        );

        return "Open";
    }
}
