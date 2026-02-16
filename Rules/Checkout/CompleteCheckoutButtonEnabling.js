export default function CompleteCheckoutButtonEnabling(context) {

    try {

        const appCD = context.getAppClientData();

        // Get current stop
        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return false;
        }

        // Check per-stop confirmations
        const loadDone =
            appCD.TruckLoadConfirmedByStop?.[stopUUID] === true;

        const infoDone =
            appCD.TruckInfoConfirmedByStop?.[stopUUID] === true;

        //const paymentDone =
        //   appCD.COCIPaymentConfirmedByStop?.[stopUUID] === true;

        // Enable only if ALL done
        return loadDone && infoDone ;

    } catch (e) {

        context.getLogger().error(
            "CompleteCheckoutButtonEnabling error: " + e
        );

        return false;
    }
}
