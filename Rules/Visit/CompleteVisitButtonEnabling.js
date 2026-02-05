export default function CompleteVisitButtonEnabling(context) {
    try {
        const appCD = context.getAppClientData();
        const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

        if (!stopUUID) {
            return false;
        }

        const deliveryDone =
            appCD.DeliveryConfirmedByStop?.[stopUUID] === true;

        const returnDone =
            appCD.ReturnConfirmedByStop?.[stopUUID] === true;

        //  Enable ONLY when BOTH are completed
        return deliveryDone && returnDone;

    } catch (e) {
        context.getLogger().error(
            "CompleteVisitButtonEnabling error: " + e
        );
        return false;
    }
}
