export default function CompleteCheckinButtonEnabling(context) {

    try {

        const appCD = context.getAppClientData();

        // Get current stop
        const stopUUID =
            (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return false;
        }

        // Per-stop checks
        const CheckInloadDone =
            appCD.CheckinTruckLoadConfirmedByStop?.[stopUUID] === true;

        const CheckIninfoDone =
            appCD.CheckinTruckInfoConfirmedByStop?.[stopUUID] === true;

        const CheckInpaymentDone =
            appCD.CheckinCOCIPaymentConfirmedByStop?.[stopUUID] === true;

        // Enable only when ALL done
        return CheckInloadDone && CheckIninfoDone && CheckInpaymentDone;

    } catch (e) {

        context.getLogger().error(
            "CompleteCheckinButtonEnabling error: " + e
        );

        return false;
    }
}
