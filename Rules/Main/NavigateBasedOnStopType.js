export default function NavigateBasedOnStopType(context) {
    let stopType = context.binding.StopType;

    // 1) Always call Stop StartDateTime action
    context.executeAction('/LMD_MDKApp/Actions/Main/Stops/StartDateTime.action');

    // 2) Only for CHECKOUT, update Route StartDateTime
    if (stopType === 'CHECKOUT') {
        // Call ReadRouteByUUID which will trigger UpdateRouteStartDateTime.js on success
        return context.executeAction('/LMD_MDKApp/Actions/Main/Routes/ReadRouteByUUID.action');
        // Navigate to Checkout page
        //return context.executeAction('/LMD_MDKApp/Actions/StartCheckout/NavToStartCheckout.action');

    } else if (stopType === 'VISIT') {
        return context.executeAction('/LMD_MDKApp/Actions/StartMyVisit/NavToMyVisitPage.action');

    } else if (stopType === 'CHECKIN') {
        return context.executeAction('/LMD_MDKApp/Actions/StartCheckin/NavToStartCheckIn.action');
    }else if (stopType === 'RELOAD_CO') {
        return context.executeAction('/LMD_MDKApp/Actions/ReloadCheckout/NavToReloadCheckout.action');
    }
}
