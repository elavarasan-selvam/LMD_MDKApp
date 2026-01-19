/**
 * Get the loaded currency for a route
 * CHECKIN overrides, then CHECKOUT, then VISIT collections
 * @param {IClientAPI} clientAPI
 */
export default async function CheckinCurrency_Loaded(clientAPI) {
    const binding = clientAPI.getPageProxy().binding;
    if (!binding?.RouteUUID) return '';

    const routeUUID = binding.RouteUUID;
    const service = '/LMD_MDKApp/Services/LMD_MA.service';

    try {
        // 1. CHECKIN STOP
        const checkinStops = await clientAPI.read(
            service,
            'Stops',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKIN'`
        );

        if (checkinStops?.length > 0) {
            const checkinStopUUID = checkinStops.getItem(0).StopUUID;

            const payIn = await clientAPI.read(
                service,
                'COCIPayments',
                [],
                `$filter=StopUUID eq guid'${checkinStopUUID}' and PaymentType eq 'CA'`
            );

            if (payIn?.length > 0) {
                const p = payIn.getItem(0);
                if (p.Currency) return p.Currency;
            }
        }

        // 2. CHECKOUT STOP
        const checkoutStops = await clientAPI.read(
            service,
            'Stops',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKOUT'`
        );

        if (checkoutStops?.length > 0) {
            const checkoutStopUUID = checkoutStops.getItem(0).StopUUID;

            const payOut = await clientAPI.read(
                service,
                'COCIPayments',
                [],
                `$filter=StopUUID eq guid'${checkoutStopUUID}' and PaymentType eq 'CA'`
            );

            if (payOut?.length > 0) {
                const p = payOut.getItem(0);
                if (p.Currency) return p.Currency;
            }
        }

        // 3. VISIT STOPS → Collections → CollectionPayments
        const visitStops = await clientAPI.read(
            service,
            'Stops',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'VISIT'`
        );

        if (visitStops?.length > 0) {
            for (let i = 0; i < visitStops.length; i++) {
                const stopUUID = visitStops.getItem(i).StopUUID;

                const collections = await clientAPI.read(
                    service,
                    'Collections',
                    [],
                    `$filter=StopUUID eq guid'${stopUUID}'`
                );

                for (let j = 0; j < collections.length; j++) {
                    const collectionReadLink = collections.getItem(j)['@odata.readLink'];

                    const payments = await clientAPI.read(
                        service,
                        `${collectionReadLink}/to_CollectionPayments`,
                        [],
                        ''
                    );

                    for (let k = 0; k < payments.length; k++) {
                        const payment = payments.getItem(k);
                        if (payment.PaymentType === 'CA' && payment.Currency) {
                            return payment.Currency;
                        }
                    }
                }
            }
        }

        return '';

    } catch (e) {
        return '';
    }
}
