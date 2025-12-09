export default async function CheckinCurrency_Loaded(clientAPI) {
    const binding = clientAPI.getPageProxy().binding;
    if (!binding) return '';

    const routeUUID = binding.RouteUUID;

    try {
        // 1. Directly get CHECKIN stop
        const checkinStops = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKIN'`
        );

        if (checkinStops && checkinStops.length > 0) {
            const checkinStopUUID = checkinStops.getItem(0).StopUUID;

            const payIn = await clientAPI.read(
                '/LMD_MDKApp/Services/LMD_MA.service',
                'COCIPayments',
                [],
                `$filter=StopUUID eq guid'${checkinStopUUID}'`
            );

            if (payIn && payIn.length > 0) {
                const p = payIn.getItem(0);
                if (p.Currency) return p.Currency;
            }
        }

        // 2. Fallback to CHECKOUT stop
        const checkoutStops = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKOUT'`
        );

        if (checkoutStops && checkoutStops.length > 0) {
            const checkoutStopUUID = checkoutStops.getItem(0).StopUUID;

            const payOut = await clientAPI.read(
                '/LMD_MDKApp/Services/LMD_MA.service',
                'COCIPayments',
                [],
                `$filter=StopUUID eq guid'${checkoutStopUUID}' and PaymentType eq 'CA'`
            );

            if (payOut && payOut.length > 0) {
                const p = payOut.getItem(0);
                return p.Currency || '';
            }
        }

        return '';

    } catch (e) {
        return '';
    }
}
