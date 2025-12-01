export default function CheckinCurrency_OnValueChange(clientAPI) {
    const appData = clientAPI.getAppClientData();
    const currency = clientAPI.getValue();

    appData.Checkin_Currency = currency;   // user-modified value
    return true;
}
