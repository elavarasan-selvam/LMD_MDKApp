export default function SetAmountPaymentloaded(clientAPI) {

    const appData = clientAPI.getAppClientData();
    const binding = clientAPI.getPageProxy().binding;

    const stopUUID = binding?.StopUUID;

    //  1) If user already entered value in this session → show it
    if (appData.Checkout_Amount !== undefined && appData.Checkout_Amount !== "") {
        return appData.Checkout_Amount;
    }

    //  2) Otherwise read from backend COCIPayments
    if (!stopUUID) {
        return "";
    }

    return clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'COCIPayments',
        [],
        `$filter=StopUUID eq guid'${stopUUID}'`
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
