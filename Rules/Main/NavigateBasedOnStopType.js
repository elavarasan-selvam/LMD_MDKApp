export default function NavigateBasedOnStopType(context) {
    let stopType = context.binding.StopType;

    // Update StartDateTime for Stop and Route first
    context.executeAction('/LMD_MDKApp/Actions/Main/Routes/StartDateTime.action');
    context.executeAction('/LMD_MDKApp/Actions/Main/Stops/StartDateTime.action');

    // Then navigate based on StopType
    if (stopType === 'CHECKOUT') {
        return context.executeAction('/LMD_MDKApp/Actions/StartCheckout/NavToStartCheckout.action');
    } else if (stopType === 'VISIT') {
        return context.executeAction('/LMD_MDKApp/Actions/StartMyVisit/NavToMyVisitPage.action');
    } else if (stopType === 'CHECKIN') {
        return context.executeAction('/LMD_MDKApp/Actions/StartCheckin/NavToStartCheckIn.action');
    }
}
