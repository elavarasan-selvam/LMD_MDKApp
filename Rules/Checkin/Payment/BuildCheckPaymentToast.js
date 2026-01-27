import CheckCurrency_Loaded from './CheckCurrency_Loaded';
import CheckTotalAmount_Loaded from './CheckTotalAmount_Loaded';

export default async function BuildCheckCheckinToast(clientAPI) {

    const appData = clientAPI.getAppClientData();

    let amount = appData.Check_Amount;
    let currency = appData.Check_Currency;

    // If user did NOT change → load from backend
    if (!amount) {
        amount = await CheckTotalAmount_Loaded(clientAPI);
    }

    if (!currency) {
        currency = await CheckCurrency_Loaded(clientAPI);
    }

    // Build message
    if (amount && currency) {
        return `Check-in Payment Cheque ${currency} ${amount} Updated`;
    }

    if (amount) {
        return `Check-in Payment Cheque ${amount} Updated`;
    }

    return "Check-in Cheque payment Updated";
}
