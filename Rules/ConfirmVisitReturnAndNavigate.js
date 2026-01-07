export default function ConfirmVisitReturnAndNavigate(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    if (stopUUID) {
        appCD.ReturnConfirmedByStop[stopUUID] = true;
    }

    return context.executeAction(
        '/LMD_MDKApp/Actions/NavBackToMyVisitFromConfirmReturn.action'
    );
}
