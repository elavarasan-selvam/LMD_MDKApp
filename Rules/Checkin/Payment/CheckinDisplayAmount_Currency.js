export default function DisplayAmount_Currency(clientAPI) {
    const appData = clientAPI.getAppClientData();

    // 1. Prefer Checkin values if present
    const currency = appData.Checkin_Currency || appData.Checkout_Currency || "";
    const amount   = appData.Checkin_Amount   || appData.Checkout_Amount   || "";

    if (currency && amount) {
        return currency + " " + amount;
    }

    // If only one exists
    return currency || amount || "";
}
