export default function CheckSetPaymentAmount(clientAPI) {
    const appData = clientAPI.getAppClientData();
    const newAmount = clientAPI.getValue();

    // Store original amount if not already stored
    if (appData._CheckOriginalAmount === undefined) {
        appData._CheckOriginalAmount = newAmount;
    }

    // Store modified amount
    appData.Check_Amount = newAmount;

    // Flag to indicate if amount has changed
    appData._CheckAmountChanged = (appData._CheckOriginalAmount !== newAmount);

    return true;
}
