export default async function DisplayAmount_Currency(clientAPI) {
    const binding = clientAPI.getPageProxy().binding;
    if (!binding || !binding.RouteUUID) return "";

    const routeUUID = binding.RouteUUID;

    try {
        // 1. Get CHECKOUT stop from route
        const checkoutStops = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKOUT'`
        );

        if (checkoutStops && checkoutStops.length > 0) {
            const checkoutStopUUID = checkoutStops.getItem(0).StopUUID;

            // 2. Read COCIPayments for CHECKOUT stop
            const payments = await clientAPI.read(
                '/LMD_MDKApp/Services/LMD_MA.service',
                'COCIPayments',
                [],
                `$filter=StopUUID eq guid'${checkoutStopUUID}'`
            );

            if (payments && payments.length > 0) {
                const payment = payments.getItem(0);
                if (payment.Currency && payment.Amount != null) {
                    return payment.Currency + " " + payment.Amount;
                }
            }
        }

        return "";

    } catch (e) {
        return "";
    }
}
