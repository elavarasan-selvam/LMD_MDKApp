export default async function CheckTotalAmount_Loaded(clientAPI) {

    const binding = clientAPI.getPageProxy().binding;
    if (!binding || !binding.RouteUUID) return "0";

    const routeUUID = binding.RouteUUID;
    const service = "/LMD_MDKApp/Services/LMD_MA.service";

    try {
        // -------------------------------
        // 1. CHECK CHECKIN STOP (COCIPayments - SINGLE RECORD)
        // -------------------------------
        const checkinStops = await clientAPI.read(
            service,
            "Stops",
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKIN'`
        );

        if (checkinStops && checkinStops.length > 0) {
            const checkinStopUUID = checkinStops.getItem(0).StopUUID;

            const checkinPayments = await clientAPI.read(
                service,
                "COCIPayments",
                [],
                `$filter=PaymentType eq 'CH' and StopUUID eq guid'${checkinStopUUID}'`
            );

            if (checkinPayments && checkinPayments.length > 0) {
                const amt = checkinPayments.getItem(0).Amount;
                return (amt !== null && amt !== undefined && amt !== "") ? amt.toString() : "0";
            }
        }

        // -------------------------------
        // 2. FALLBACK TO VISIT STOPS (CollectionPayments - MAY HAVE MULTIPLE)
        // -------------------------------
        const visitStops = await clientAPI.read(
            service,
            "Stops",
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'VISIT'`
        );

        let visitTotal = 0;

        if (visitStops && visitStops.length > 0) {
            for (let i = 0; i < visitStops.length; i++) {
                const stopUUID = visitStops.getItem(i).StopUUID;

                const payments = await clientAPI.read(
                    service,
                    "CollectionPayments",
                    [],
                    `$filter=PaymentType eq 'CH' and StopUUID eq guid'${stopUUID}'`
                );

                if (payments && payments.length > 0) {
                    for (let j = 0; j < payments.length; j++) {
                        const amt = payments.getItem(j).Amount;
                        if (amt !== null && amt !== undefined && amt !== "") {
                            visitTotal += Number(amt);
                        }
                    }
                }
            }
        }

        return visitTotal === 0 ? "0" : visitTotal.toString();

    } catch (e) {
        return "0";
    }
}
