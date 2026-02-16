/**
 * Show Start button for Check-in Payment (Per Stop)
 * @param {IClientAPI} context
 */
export default function IsStartButtonVisibleforCOCICheckinPayment(context) {
    try {

        const appCD = context.getAppClientData();

        // Get current stop
        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return true; // show button by default
        }

        const isConfirmed =
            appCD.CheckinCOCIPaymentConfirmedByStop?.[stopUUID] === true;

        // Show only if NOT confirmed
        return !isConfirmed;

    } catch (e) {

        context.getLogger().error(
            "IsStartButtonVisibleforCOCICheckinPayment error: " + e
        );

        return true;
    }
}
