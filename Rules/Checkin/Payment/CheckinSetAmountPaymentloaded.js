export default async function CheckinSetAmountPaymentloaded(clientAPI) {
    const binding = clientAPI.getPageProxy().binding;
    if (!binding) return "";

    const routeUUID = binding.RouteUUID;
    if (!routeUUID) return "";

    try {
        // 1. Read CHECKIN stop using RouteUUID
        const checkinStops = await clientAPI.read(
            "/LMD_MDKApp/Services/LMD_MA.service",
            "Stops",
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKIN'`
        );

        if (checkinStops && checkinStops.length > 0) {
            const checkinStopUUID = checkinStops.getItem(0).StopUUID;

            const checkinPayments = await clientAPI.read(
                "/LMD_MDKApp/Services/LMD_MA.service",
                "COCIPayments",
                [],
                `$filter=StopUUID eq guid'${checkinStopUUID}'`
            );

            if (checkinPayments && checkinPayments.length > 0) {
                const payment = checkinPayments.getItem(0);
                if (payment.Amount !== null && payment.Amount !== undefined && payment.Amount !== "") {
                    return payment.Amount;
                }
            }
        }

        // 2. If no CHECKIN payment, read CHECKOUT stop
        const checkoutStops = await clientAPI.read(
            "/LMD_MDKApp/Services/LMD_MA.service",
            "Stops",
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKOUT'`
        );

        if (checkoutStops && checkoutStops.length > 0) {
            const checkoutStopUUID = checkoutStops.getItem(0).StopUUID;

            const checkoutPayments = await clientAPI.read(
                "/LMD_MDKApp/Services/LMD_MA.service",
                "COCIPayments",
                [],
                `$filter=StopUUID eq guid'${checkoutStopUUID}'`
            );

            if (checkoutPayments && checkoutPayments.length > 0) {
                const payment = checkoutPayments.getItem(0);
                if (payment.Amount !== null && payment.Amount !== undefined && payment.Amount !== "") {
                    return payment.Amount;
                }
            }
        }

        return "";
    } catch {
        return "";
    }
}
