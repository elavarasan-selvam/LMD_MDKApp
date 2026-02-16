/**
 * Get Check-in Payment Description (Per Stop)
 * @param {IClientAPI} context
 */
export default function GetCOCICheckinPayment_Description(context) {
    try {

        const appCD = context.getAppClientData();

        // Get current stop
        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return "Record and confirm the amount of cash you receive for this stop.";
        }

        const isConfirmed =
            appCD.CheckinCOCIPaymentConfirmedByStop?.[stopUUID] === true;

        if (isConfirmed) {
            return ""; // Done → no description
        }

        // Open → show description
        return "Record and confirm the amount of cash you receive for this stop.";

    } catch (e) {

        context.getLogger().error(
            "GetCOCICheckinPayment_Description error: " + e
        );

        return "Record and confirm the amount of cash you receive for this stop.";
    }
}
