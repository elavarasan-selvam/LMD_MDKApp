export default function Currency_OnValueChange(clientAPI) {

    const appData = clientAPI.getAppClientData();

    let currency = clientAPI.getValue(); // array

    // Extract from array
    if (Array.isArray(currency) && currency.length > 0) {
        currency = currency[0].ReturnedValue || currency[0].DisplayValue || "";
    }

    // Store only string
    appData.Checkout_Currency = currency;

    return true;
}
