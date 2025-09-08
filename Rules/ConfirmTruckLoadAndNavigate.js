export default function ConfirmTruckLoadAndNavigate(context) {
    context.getAppClientData().TruckLoadConfirmed = true;

    // Navigate back to Checkout
    return context.executeAction('/LMD_MDKApp/Actions/StartCheckout/NavBackToCheckoutFromConfirmTruckInfo.action');
}
