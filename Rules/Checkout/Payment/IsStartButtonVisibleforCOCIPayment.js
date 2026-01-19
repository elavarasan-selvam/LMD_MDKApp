/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function IsStartButtonVisibleforCOCIPayment(context){
    try {
        // Show Start button only if TruckLoadConfirmed is false
        let isConfirmed = context.getAppClientData().COCIPaymentConfirmed;
        return !isConfirmed;  // true = visible, false = hidden
    } catch (e) {
        context.getLogger().error("IsStartButtonVisibleforCOCIPayment error: " + e);
        return true;  // safe fallback: show button
    }
}
