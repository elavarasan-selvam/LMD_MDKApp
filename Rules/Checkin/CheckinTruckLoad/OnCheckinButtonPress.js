export default function OnCheckinButtonPress(context) {

    const appCD = context.getAppClientData();

    const isStart = appCD.StartButton;

    // Get current stop safely
    const stopUUID =
        (appCD.currentStop || context.binding)?.StopUUID;

    if (isStart) {

        // Go to Truck Load screen
        return context.executeAction(
            '/LMD_MDKApp/Actions/StartCheckin/NavToCheckinTruckLoad.action'
        );

    } else {

        // Mark TruckLoad done for THIS stop
        if (stopUUID) {

            if (!appCD.CheckinTruckLoadConfirmedByStop) {
                appCD.CheckinTruckLoadConfirmedByStop = {};
            }

            appCD.CheckinTruckLoadConfirmedByStop[stopUUID] = true;
        }

        // Go back to Checkin page
        return context.executeAction(
            '/LMD_MDKApp/Actions/StartCheckin/NavBackToCheckinFromConfirmButton.action'
        );
    }
}
