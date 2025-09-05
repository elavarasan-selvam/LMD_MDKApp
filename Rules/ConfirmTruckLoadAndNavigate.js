export default function ConfirmTruckLoadAndNavigate(context) {
    // set client data flag before navigation
    context.getPageProxy().getClientData().TruckLoadConfirmed = true;

    // now execute your navigation action
    return context.executeAction('/LMD_MDKApp/Actions/StartCheckout/NavBackToCheckoutFromConfirmTruckInfo.action');
}
