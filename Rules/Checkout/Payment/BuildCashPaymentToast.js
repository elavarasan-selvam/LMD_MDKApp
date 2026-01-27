export default function BuildCashPaymentToast(clientAPI) {

    const appData = clientAPI.getAppClientData();

    const amount = appData.Checkout_Amount || "";
    const currency = appData.Checkout_Currency || "";

    if (amount && currency) {
        return `Cash ${currency} ${amount} uploaded`;
    }

    if (amount) {
        return `Cash ${amount} uploaded`;
    }

    return "Cash payment uploaded";
}
