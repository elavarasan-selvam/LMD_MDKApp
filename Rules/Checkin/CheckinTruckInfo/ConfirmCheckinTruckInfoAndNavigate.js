export default function ConfirmTruckInfoAndNavigate(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    if (stopUUID) {

        if (!appCD.CheckinTruckInfoConfirmedByStop) {
            appCD.CheckinTruckInfoConfirmedByStop = {};
        }

        appCD.CheckinTruckInfoConfirmedByStop[stopUUID] = true;
    }
    return context.executeAction('/LMD_MDKApp/Actions/StartCheckin/OdometerUpdateMessage.action');
}
