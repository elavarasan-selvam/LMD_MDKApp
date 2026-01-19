/**
 * Check CH payment currency
 * Priority:
 * 1. CHECKIN stop (if present, return immediately)
 * 2. VISIT stops → return currency ONLY if all are same
 * @param {IClientAPI} clientAPI
 */
export default async function CheckCurrency_Loaded(clientAPI) {

    const binding = clientAPI.getPageProxy().binding;
    if (!binding || !binding.RouteUUID) {
        return "";
    }

    const routeUUID = binding.RouteUUID;
    const service = "/LMD_MDKApp/Services/LMD_MA.service";

    try {

        // ===============================
        // 1. CHECKIN STOP (OVERRIDES ALL)
        // ===============================
        const checkinStops = await clientAPI.read(
            service,
            "Stops",
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKIN'`
        );

        if (checkinStops.length > 0) {

            const stopUUID = checkinStops.getItem(0).StopUUID;

            const payments = await clientAPI.read(
                service,
                "COCIPayments",
                [],
                `$filter=StopUUID eq guid'${stopUUID}' and PaymentType eq 'CH'`
            );

            if (payments.length > 0) {
                return payments.getItem(0).Currency || "";
            }
        }

        // ===============================
        // 2. VISIT STOPS – CHECK ALL
        // ===============================
        const visitStops = await clientAPI.read(
            service,
            "Stops",
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'VISIT'`
        );

        let finalCurrency = null;

        for (let i = 0; i < visitStops.length; i++) {

            const stopUUID = visitStops.getItem(i).StopUUID;

            const collections = await clientAPI.read(
                service,
                "Collections",
                [],
                `$filter=StopUUID eq guid'${stopUUID}'`
            );

            for (let j = 0; j < collections.length; j++) {

                const collection = collections.getItem(j);
                const collectionReadLink = collection["@odata.readLink"];

                const payments = await clientAPI.read(
                    service,
                    "CollectionPayments",
                    [],
                    `$filter=PaymentType eq 'CH'`,
                    collectionReadLink
                );

                for (let k = 0; k < payments.length; k++) {

                    const currency = payments.getItem(k).Currency;

                    if (!currency) {
                        continue;
                    }

                    if (finalCurrency === null) {
                        finalCurrency = currency;   // first currency found
                    } else if (finalCurrency !== currency) {
                        return "";
                    }
                }
            }
        }

        return finalCurrency || "";

    } catch (e) {
        alert("Error in CheckCurrency_Loaded: " + e.message);
        return "";
    }
}
