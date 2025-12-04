export default async function Currency_Loaded(clientAPI) {
    const appData = clientAPI.getAppClientData();

    if (appData.Checkout_Currency) {
        return appData.Checkout_Currency;
    }

    const binding = clientAPI.getPageProxy().binding;
    if (!binding || !binding.RouteUUID) {
        return "";
    }

    const routeUUID = binding.RouteUUID;

    try {
        // Get the CHECKOUT stop for this route
        const stopResult = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKOUT'`
        );

        if (stopResult && stopResult.length > 0) {
            const checkoutStopUUID = stopResult.getItem(0).StopUUID;

            // Read COCIPayments for this CHECKOUT stop
            const paymentResult = await clientAPI.read(
                '/LMD_MDKApp/Services/LMD_MA.service',
                'COCIPayments',
                [],
                `$filter=StopUUID eq guid'${checkoutStopUUID}'`
            );

            if (paymentResult && paymentResult.length > 0) {
                const payment = paymentResult.getItem(0);
                return payment.Currency || "";
            }
        }

        return "";

    } catch (e) {
        return "";
    }
}
