export default function ConfirmTruckLoadAndNavigate(context) {
    context.getAppClientData().CheckinTruckLoadConfirmed = true;
    
    // Navigate back to CheckIn
    return context.executeAction('/LMD_MDKApp/Actions/CloseModalPage_Complete.action');
}
