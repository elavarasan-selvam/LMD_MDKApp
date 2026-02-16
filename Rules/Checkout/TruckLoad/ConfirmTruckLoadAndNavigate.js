export default function ConfirmTruckLoadAndNavigate(context) {
    //context.getAppClientData().TruckLoadConfirmed = true;
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    if (stopUUID) {

        if (!appCD.TruckLoadConfirmedByStop) {
            appCD.TruckLoadConfirmedByStop = {};
        }

        appCD.TruckLoadConfirmedByStop[stopUUID] = true;
    }
    // Navigate back to Checkout
    return context.executeAction('/LMD_MDKApp/Actions/ClosePage.action');
}
