/**
 * Return the loaded value for PaymentType input
 * @param {IClientAPI} clientAPI
 */
export default function PaymentTypeInitialValue(clientAPI) {
    const appData = clientAPI.getAppClientData();

    // If user has already selected, return the stored value
    if (appData.Checkout_PaymentType) {
        return String(appData.Checkout_PaymentType); // Ensure string
    }

    // Start blank if nothing entered
    return 'CA';
}
