export default function ConfirmTruckInfoAndNavigate(context) {
    context.getAppClientData().CheckinTruckInfoConfirmed = true;
    //context.getAppClientData().CompleteCheckoutButton = true;

    // Navigate back to Checkin
    return context.executeAction('/LMD_MDKApp/Actions/StartCheckin/NavBackToCheckinFromConfirmTruckInfo.action');
}
