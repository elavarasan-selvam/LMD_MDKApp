export default function CheckCurrency_OnValueChange(clientAPI) {
    const appData = clientAPI.getAppClientData();
    const currency = clientAPI.getValue();

    //alert("CHECK Currency changed to: " + currency);

    appData.Check_Currency = currency;   // store modified currency
    return true;
}
