export default function ConfirmTruckInfoAndNavigate(context) {
    context.getAppClientData().TruckInfoConfirmed = true;
    //context.getAppClientData().CompleteCheckoutButton = true;

    // Navigate back to Checkout
    return context.executeAction('/LMD_MDKApp/Actions/StartCheckout/NavBackToCheckoutFromConfirmTruckInfo.action');
}
