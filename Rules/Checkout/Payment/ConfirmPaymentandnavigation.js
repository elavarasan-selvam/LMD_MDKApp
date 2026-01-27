/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function ConfirmPaymentandnavigation(context) {
    //alert(JSON.stringify(context.binding));
    context.getAppClientData().COCIPaymentConfirmed = true;
    //context.getAppClientData().CompleteCheckoutButton = true;

    // Navigate back to Checkout
    //return context.executeAction('/LMD_MDKApp/Actions/StartCheckout/Checkout/Payment/Nav_Back_To_Checkout_from_Payment.action');
    return context.executeAction('/LMD_MDKApp/Actions/CloseModalPage_Complete.action');
}
