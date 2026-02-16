export default function IsStartButtonVisibleforCOCIPayment(context) {
    try {

        const appCD = context.getAppClientData();

        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return true;
        }

        const isConfirmed =
            appCD.COCIPaymentConfirmedByStop?.[stopUUID] === true;

        // Show only if NOT confirmed
        return !isConfirmed;

    } catch (e) {

        context.getLogger().error(
            "IsStartButtonVisibleforCOCIPayment error: " + e
        );

        return true;
    }
}
