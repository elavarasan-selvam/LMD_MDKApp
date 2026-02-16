export default function GetCOCIPayment_Status(context) {
    try {

        const appCD = context.getAppClientData();

        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return "Open";
        }

        const isConfirmed =
            appCD.COCIPaymentConfirmedByStop?.[stopUUID] === true;

        return isConfirmed ? "Done" : "Open";

    } catch (e) {

        context.getLogger().error(
            "COCIPayment Status error: " + e
        );

        return "Open";
    }
}
