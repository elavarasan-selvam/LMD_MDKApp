/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function ConfirmPaymentandnavigation(context) {
    //alert(JSON.stringify(context.binding));
    const appCD = context.getAppClientData();

    // Get StopUUID safely
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    if (stopUUID) {

        if (!appCD.COCIPaymentConfirmedByStop) {
            appCD.COCIPaymentConfirmedByStop = {};
        }

        // Mark payment confirmed for this stop only
        appCD.COCIPaymentConfirmedByStop[stopUUID] = true;
    }

    return context.executeAction('/LMD_MDKApp/Actions/StartCheckout/Checkout/Payment/CashPaymentUpdatedMessage.action');
}
