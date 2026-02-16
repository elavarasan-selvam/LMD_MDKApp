export default function GetTruckLoadStatus(context) {
    try {

        const appCD = context.getAppClientData();

        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return "Open";
        }

        const isConfirmed =
            appCD.TruckLoadConfirmedByStop?.[stopUUID] === true;

        return isConfirmed ? "Done" : "Open";

    } catch (e) {

        context.getLogger().error(
            "GetTruckLoadStatus error: " + e
        );

        return "Open";
    }
}
