/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function DisplayAmount_Currency(clientAPI) {
const appData = clientAPI.getAppClientData();

    const currency = appData.Checkout_Currency || '';
    const amount = appData.Checkout_Amount || '';

    if (currency && amount) {
        return `${currency} ${amount}`;   
    }

    // If only one exists
    return currency || amount || '';
}