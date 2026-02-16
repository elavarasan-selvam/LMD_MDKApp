export default function GetTruckInfoStatus(context) {
    try {

        const appCD = context.getAppClientData();

        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return "Open";
        }

        const isConfirmed =
            appCD.TruckInfoConfirmedByStop?.[stopUUID] === true;

        return isConfirmed ? "Done" : "Open";

    } catch (e) {

        context.getLogger().error(
            "GetTruckInfoStatus error: " + e
        );

        return "Open";
    }
}
