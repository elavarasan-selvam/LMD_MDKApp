export default async function CheckPaymentSaveDebug(context) {
    const appData = context.getAppClientData();
    const pageProxy = context.getPageProxy();
    const amountControl = pageProxy.getControl('CheckinCheckAmountInput');
    const currencyControl = pageProxy.getControl('CheckinCheckCurrencyInput');
    const amountValue = amountControl ? amountControl.getValue() : appData.Check_Amount;
    const currencyValue = currencyControl ? currencyControl.getValue() : appData.Check_Currency;
    const amount = Number(amountValue || 0);
    const currency = Array.isArray(currencyValue)
        ? (currencyValue[0] && (currencyValue[0].ReturnedValue || currencyValue[0].DisplayValue)) || ''
        : (currencyValue && currencyValue.ReturnedValue) || currencyValue || '';

//    alert(`Check Save tapped\nAmount: ${amount}\nCurrency: ${currency}`);

    return context.executeAction(
        '/LMD_MDKApp/Actions/StartCheckin/Payment/COCI_CheckPayment.action'
    );
}
