/**
 * Store selected PaymentType in AppClientData
 * Return string value for ListPicker
 * @param {IClientAPI} clientAPI
 */
export default function PaymentType_OnValueChange(clientAPI) {
    const appData = clientAPI.getAppClientData();
    const value = clientAPI.getValue(); // ListPicker may return array

    let finalValue = '';

    if (Array.isArray(value) && value.length > 0) {
        finalValue = String(value[0]); // take first item
    } else if (typeof value === 'string') {
        finalValue = value;
    }

    appData.Checkout_PaymentType = finalValue; // store in AppClientData
    return finalValue; // Important: return string, not array/object
}
