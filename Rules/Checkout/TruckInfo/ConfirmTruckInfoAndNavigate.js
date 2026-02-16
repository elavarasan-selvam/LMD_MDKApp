export default function ConfirmTruckInfoAndNavigate(context) {
    const appCD = context.getAppClientData();

    // Get StopUUID safely
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    if (stopUUID) {

        if (!appCD.TruckInfoConfirmedByStop) {
            appCD.TruckInfoConfirmedByStop = {};
        }

        // Mark truck info confirmed for this stop only
        appCD.TruckInfoConfirmedByStop[stopUUID] = true;
    }
    return context.executeAction('/LMD_MDKApp/Actions/StartCheckout/TruckInfo/OdometerBeginUpdated.action');
}
