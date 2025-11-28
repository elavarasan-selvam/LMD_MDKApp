/**
 * Store latest entered currency on value change
 * @param {IClientAPI} clientAPI
 */
export default function Currency_OnValueChange(clientAPI) {
    const appData = clientAPI.getAppClientData();

    const currency = clientAPI.getValue();  // latest entered value

    // Store in AppClientData
    appData.Checkout_Currency = currency;

    return true;  
}