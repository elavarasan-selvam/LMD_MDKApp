export default async function CheckDisplayAmount_Currency_FromVisits(clientAPI) {

    const binding = clientAPI.getPageProxy().binding;
    if (!binding || !binding.RouteUUID) {
        return "0";
    }

    const routeUUID = binding.RouteUUID;
    const service = "/LMD_MDKApp/Services/LMD_MA.service";

    try {
        // ==================================================
        // 1. CHECK CHECKIN STOP FIRST (CH)
        // ==================================================
        const checkinStops = await clientAPI.read(
            service,
            "Stops",
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKIN'`
        );

        if (checkinStops?.length > 0) {
            const checkinStopUUID = checkinStops.getItem(0).StopUUID;

            const checkinPayments = await clientAPI.read(
                service,
                "COCIPayments",
                [],
                `$filter=StopUUID eq guid'${checkinStopUUID}' and PaymentType eq 'CH'`
            );

            if (checkinPayments?.length > 0) {
                const payment = checkinPayments.getItem(0);
                const amount = Number(payment.Amount) || 0;

                if (amount === 0) return "0";
                return `${payment.Currency} ${amount}`;
            }
        }

        // ==================================================
        // 2. FALLBACK → SUM FROM VISIT STOPS (CH)
        // ==================================================
        const visitStops = await clientAPI.read(
            service,
            "Stops",
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'VISIT'`
        );

        if (!visitStops || visitStops.length === 0) {
            return "0";
        }

        let total = 0;
        let currency = "";

        for (let i = 0; i < visitStops.length; i++) {
            const stopUUID = visitStops.getItem(i).StopUUID;

            const payments = await clientAPI.read(
                service,
                "CollectionPayments",
                [],
                `$filter=StopUUID eq guid'${stopUUID}' and PaymentType eq 'CH'`
            );

            for (let j = 0; j < payments.length; j++) {
                const p = payments.getItem(j);
                const amt = Number(p.Amount) || 0;

                total += amt;
                if (!currency && p.Currency) {
                    currency = p.Currency;
                }
            }
        }

        if (total === 0) return "0";
        return `${currency} ${total}`;

    } catch (e) {
        alert("Error in CheckDisplayAmount_Currency_FromVisits: " + e);
        return "0";
    }
}
