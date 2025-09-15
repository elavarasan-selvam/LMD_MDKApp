export default function OnCheckinButtonPress(context) {
    let isStart = context.getAppClientData().StartButton;

    if (isStart) {
        // Navigate to Truck Load page
        return context.executeAction('/LMD_MDKApp/Actions/StartCheckin/NavToCheckinTruckLoad.action');
    } else {
        // Navigate Back to the Checkin page
        context.getAppClientData().CheckinTruckLoadConfirmed = true;
        return context.executeAction('/LMD_MDKApp/Actions/StartCheckin/NavBackToCheckinFromConfirmButton.action');
    }
}
