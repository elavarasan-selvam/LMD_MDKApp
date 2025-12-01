export default function CheckinSetAmountPaymentloaded(clientAPI) {
    const appData = clientAPI.getAppClientData();
    const binding = clientAPI.getPageProxy().binding;
    const stopUUID = binding?.StopUUID;

    // 1. If user already changed in Checkin
    if (appData.Checkin_Amount !== undefined && appData.Checkin_Amount !== "") {
        return appData.Checkin_Amount;
    }

    // 2. Otherwise take from Checkout
    if (appData.Checkout_Amount !== undefined && appData.Checkout_Amount !== "") {
        return appData.Checkout_Amount;
    }

    // 3. Otherwise read from backend
    if (!stopUUID) {
        return "";
    }

    return clientAPI.read(
        "/LMD_MDKApp/Services/LMD_MA.service",
        "COCIPayments",
        [],
        "$filter=StopUUID eq guid'" + stopUUID + "'"
    ).then(result => {
        if (result && result.length > 0) {
            const payment = result.getItem ? result.getItem(0) : result[0];
            return payment.Amount || "";
        }
        return "";
    }).catch(() => {
        return "";
    });
}
