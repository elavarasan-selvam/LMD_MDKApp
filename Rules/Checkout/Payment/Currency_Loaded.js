export default function Currency_Loaded(clientAPI) {
    const appData = clientAPI.getAppClientData();

    // If user already entered earlier → show it
    if (appData.Checkout_Currency) {
        return appData.Checkout_Currency;
    }

    // Otherwise start blank
    return "";
}