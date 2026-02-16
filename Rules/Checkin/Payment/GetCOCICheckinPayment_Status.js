/**
 * Get Check-in Payment Status (Per Stop)
 * @param {IClientAPI} context
 */
export default function GetCOCIPayment_Status(context) {
    try {

        const appCD = context.getAppClientData();

        // Get current stop safely
        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return "Open";
        }

        const isConfirmed =
            appCD.CheckinCOCIPaymentConfirmedByStop?.[stopUUID] === true;

        if (isConfirmed) {
            return "Done";
        }

        return "Open";

    } catch (e) {

        context.getLogger().error(
            "GetCOCIPayment_Status error: " + e
        );

        return "Open";
    }
}
