export default function CheckCurrency_OnValueChange(clientAPI) {

    const appData = clientAPI.getAppClientData();

    let currency = clientAPI.getValue();

    // Extract from ListPicker array
    if (Array.isArray(currency) && currency.length > 0) {
        currency = currency[0].ReturnedValue || currency[0].DisplayValue || "";
    }

    appData.Check_Currency = currency;

    return true;
}
