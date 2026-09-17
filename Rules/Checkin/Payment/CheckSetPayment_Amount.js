export default function CheckSetPaymentAmount(clientAPI) {
    const appData = clientAPI.getAppClientData();
    const rawValue = clientAPI.getValue();
    const newAmount = rawValue === null || rawValue === undefined || rawValue === '' ? 0 : Number(rawValue);
 
    if (appData._CheckOriginalAmount === undefined) {
        appData._CheckOriginalAmount = newAmount;
    }
 
    appData.Check_Amount = Number.isFinite(newAmount) ? newAmount : 0;
    appData._CheckAmountChanged = (appData._CheckOriginalAmount !== appData.Check_Amount);
 
    return true;
}