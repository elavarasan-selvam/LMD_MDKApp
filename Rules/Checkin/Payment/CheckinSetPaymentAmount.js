export default function CheckinSetPaymentAmount(clientAPI) {
    const appData = clientAPI.getAppClientData();
    const newAmount = clientAPI.getValue();

    if (appData._CheckinOriginalAmount === undefined) {
        appData._CheckinOriginalAmount = newAmount;
    }

    appData.Checkin_Amount = newAmount;   // user-modified value
    appData._CheckinAmountChanged = (appData._CheckinOriginalAmount !== newAmount);

    return true;
}
