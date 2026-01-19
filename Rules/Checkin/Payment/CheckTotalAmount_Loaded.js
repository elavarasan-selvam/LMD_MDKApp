/**
 * Calculate CHECK (CH) payment loaded for a route
 * CHECKIN overrides everything
 * @param {IClientAPI} clientAPI
 */
export default async function CheckTotalAmount_Loaded(clientAPI) {

    const binding = clientAPI.getPageProxy().binding;
    if (!binding?.RouteUUID) {
        // alert("Binding or RouteUUID missing");
        return "0";
    }

    const routeUUID = binding.RouteUUID;
    const service = "/LMD_MDKApp/Services/LMD_MA.service";
    let totalAmount = 0;

    try {
        // 1. CHECKIN OVERRIDE
        const checkinStops = await clientAPI.read(
            service,
            "Stops",
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKIN'`
        );

        if (checkinStops?.length > 0) {
            const stopUUID = checkinStops.getItem(0).StopUUID;

            const checkinPayments = await clientAPI.read(
                service,
                "COCIPayments",
                [],
                `$filter=StopUUID eq guid'${stopUUID}' and PaymentType eq 'CH'`
            );

            if (checkinPayments?.length > 0) {
                const amt = Number(checkinPayments.getItem(0).Amount || 0);
                // alert("CHECKIN CH OVERRIDE AMOUNT: " + amt);
                return amt.toString();
            }
        }

        // 2. VISIT STOPS → Collections → CollectionPayments
        const visitStops = await clientAPI.read(
            service,
            "Stops",
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'VISIT'`
        );

        for (let i = 0; i < visitStops.length; i++) {
            const stopUUID = visitStops.getItem(i).StopUUID;

            const collections = await clientAPI.read(
                service,
                "Collections",
                [],
                `$filter=StopUUID eq guid'${stopUUID}'`
            );

            for (let j = 0; j < collections.length; j++) {
                const collectionReadLink = collections.getItem(j)["@odata.readLink"];

                const payments = await clientAPI.read(
                    service,
                    `${collectionReadLink}/to_CollectionPayments`,
                    [],
                    '' // fetch all, filter by type manually
                );

                for (let k = 0; k < payments.length; k++) {
                    const payment = payments.getItem(k);
                    if (payment.PaymentType === 'CH') {
                        totalAmount += Number(payment.Amount || 0);
                    }
                }
            }
        }

        // alert("FINAL TOTAL CH AMOUNT: " + totalAmount);
        return totalAmount.toString();

    } catch (e) {
        // alert("Error in CheckTotalAmount_Loaded: " + e.message);
        return "0";
    }
}
