export default function NavigateBasedOnStopType(context) {
    let stopType = context.binding.StopType;

    if (stopType === 'CHECKOUT') {
        return context.executeAction('/LMD_MDKApp/Actions/StartCheckout/NavToStartCheckout.action');
    } else if (stopType === 'VISIT') {
        return context.executeAction('/LMD_MDKApp/Actions/StartMyVisit/NavToMyVisitPage.action');
    } else if (stopType === 'CHECKIN') {
        return context.executeAction('/LMD_MDKApp/Actions/StartCheckin/NavToStartCheckIn.action');
    }
}

