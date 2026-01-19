/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function ConfirmCheckinPaymentandnavigation(context) {
    //alert(JSON.stringify(context.binding));
    context.getAppClientData().CheckinCOCIPaymentConfirmed = true;
    //context.getAppClientData().CompleteCheckoutButton = true;

    // Navigate back to Checkout
    return context.executeAction('/LMD_MDKApp/Actions/StartCheckin/Payment/Nav_Back_To_Checkout_from_Payment.action');
}
