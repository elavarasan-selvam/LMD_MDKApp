export default function ConfirmTruckLoadAndNavigate(context) {
    context.getAppClientData().CheckinTruckLoadConfirmed = true;
    
    // Navigate back to Checkout
    return context.executeAction('/LMD_MDKApp/Actions/StartCheckin/NavBackToCheckinFromConfirmTruckLoad.action');
}
