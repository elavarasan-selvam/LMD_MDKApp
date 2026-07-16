export default function ConfirmTruckLoadAndNavigate(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    if (stopUUID) {

        if (!appCD.CheckinTruckLoadConfirmedByStop) {
            appCD.CheckinTruckLoadConfirmedByStop = {};
        }

        appCD.CheckinTruckLoadConfirmedByStop[stopUUID] = true;
    }
    
    // Navigate back to CheckIn
    return context.executeAction('/LMD_MDKApp/Actions/CloseModalPage_Complete.action');
}
