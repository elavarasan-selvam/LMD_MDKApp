import CheckinCurrency_Loaded from './CheckinCurrency_Loaded';
import CheckinSetAmountPaymentloaded from './CheckinSetAmountPaymentloaded';

export default async function BuildCashCheckinToast(clientAPI) {

    const appData = clientAPI.getAppClientData();

    let amount = appData.Checkin_Amount;
    let currency = appData.Checkin_Currency;

    // If user did NOT change → load from backend
    if (!amount) {
        amount = await CheckinSetAmountPaymentloaded(clientAPI);
    }

    if (!currency) {
        currency = await CheckinCurrency_Loaded(clientAPI);
    }

    // Build message
    if (amount && currency) {
        return `Check-in Payment Cash ${currency} ${amount} Updated`;
    }

    if (amount) {
        return `Check-in Payment Cash ${amount} Updated`;
    }

    return "Check-in payment Updated";
}
