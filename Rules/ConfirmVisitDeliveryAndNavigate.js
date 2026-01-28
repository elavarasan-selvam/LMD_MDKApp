export default function ConfirmVisitDeliveryAndNavigate(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    if (stopUUID) {
        appCD.DeliveryConfirmedByStop[stopUUID] = true;
    }

    return context.executeAction(
        '/LMD_MDKApp/Actions/ClosePage.action'
   );
}
