export default function CheckinCurrency_Loaded(clientAPI) {
    const appData = clientAPI.getAppClientData();

    // 1. If user already changed in Checkin
    if (appData.Checkin_Currency) {
        return appData.Checkin_Currency;
    }

    // 2. Otherwise take from Checkout
    if (appData.Checkout_Currency) {
        return appData.Checkout_Currency;
    }

    return "";
}
