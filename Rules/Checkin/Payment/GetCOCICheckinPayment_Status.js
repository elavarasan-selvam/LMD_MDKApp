/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function GetCOCIPayment_Status(context) {
    try {
        // Read the confirmation flag
        let isConfirmed = context.getAppClientData().CheckinCOCIPaymentConfirmed;
        if (isConfirmed === true) {
            return "Done";   // only after confirmation
        }
        return "Open";       // default before confirmation
    } catch (e) {
        context.getLogger().error("COCIPaymentConfirmed error: " + e);
        return "Open";       // fallback
    }
}
