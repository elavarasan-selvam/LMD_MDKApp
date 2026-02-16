export default function GetCheckinTruckLoadDescription(context) {
    try {

        const appCD = context.getAppClientData();

        // Get current stop
        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return "Confirm the number of loaded items.";
        }

        const isConfirmed =
            appCD.CheckinTruckLoadConfirmedByStop?.[stopUUID] === true;

        // If done → hide description
        if (isConfirmed) {
            return "";
        }

        // If open → show description
        return "Confirm the number of loaded items.";

    } catch (e) {

        context.getLogger().error(
            "GetCheckinTruckLoadDescription error: " + e
        );

        return "Confirm the number of loaded items.";
    }
}
