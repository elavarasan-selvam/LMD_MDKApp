export default function SetPaymentAmount(clientAPI) {

    const appData = clientAPI.getAppClientData();
    const page = clientAPI.getPageProxy();
    const binding = page.binding;

    const newAmount = clientAPI.getValue();

    // Store original only once (for change tracking if needed)
    if (appData._OriginalAmount === undefined) {
        appData._OriginalAmount = newAmount;
    }

    // Store latest value
    appData.Checkout_Amount = newAmount;

    // Optional change flag
    appData._AmountChanged = (appData._OriginalAmount !== newAmount);

    return true;   // MUST return boolean for OnValueChange
}
