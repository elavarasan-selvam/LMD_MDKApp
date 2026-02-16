export default function GetCheckinTruckInfoDescription(context) {
    try {

        const appCD = context.getAppClientData();

        // Get current stop
        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return "Record the odometer reading of your truck.";
        }

        const isConfirmed =
            appCD.CheckinTruckInfoConfirmedByStop?.[stopUUID] === true;

        // If done → hide description
        if (isConfirmed) {
            return "";
        }

        // If open → show description
        return "Record the odometer reading of your truck.";

    } catch (e) {

        context.getLogger().error(
            "GetCheckinTruckInfoDescription error: " + e
        );

        return "Record the odometer reading of your truck.";
    }
}
