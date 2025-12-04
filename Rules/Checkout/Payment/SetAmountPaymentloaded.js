export default async function SetAmountPaymentloaded(clientAPI) {
    const binding = clientAPI.getPageProxy().binding;
    if (!binding) {
        return "";
    }

    const routeUUID = binding.RouteUUID;

    try {
        // 1. Get the CHECKOUT stop for this route
        const stopResult = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKOUT'`
        );

        if (stopResult && stopResult.length > 0) {
            const checkoutStopUUID = stopResult.getItem(0).StopUUID;

            // 2. Read COCIPayments for CHECKOUT stop
            const paymentResult = await clientAPI.read(
                '/LMD_MDKApp/Services/LMD_MA.service',
                'COCIPayments',
                [],
                `$filter=StopUUID eq guid'${checkoutStopUUID}'`
            );

            if (paymentResult && paymentResult.length > 0) {
                const payment = paymentResult.getItem(0);
                if (payment.Amount !== null && payment.Amount !== undefined) {
                    return payment.Amount;
                }
            }
        }

        return "";

    } catch (e) {
        return "";
    }
}
