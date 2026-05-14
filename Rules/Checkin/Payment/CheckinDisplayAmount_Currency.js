/**
 * Calculate CA payment loaded for a route
 * CHECKIN overrides everything if present
 * Source: Collections → CollectionPayments (navigation)
 * @param {IClientAPI} clientAPI
 */
export default async function CheckinSetAmountPaymentloaded(clientAPI) {

    const binding = clientAPI.getPageProxy().binding;
    if (!binding?.RouteUUID) {
        alert("RouteUUID missing");
        return 0;
    }

    const routeUUID = binding.RouteUUID;
    const service = "/LMD_MDKApp/Services/LMD_MA.service";
    let totalAmount = 0;

    try {
        // 1. CHECKIN STOP
        const checkinStops = await clientAPI.read(
            service,
            "Stops",
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKIN'`
        );

        // alert("CHECKIN Stops found: " + checkinStops.length);

        if (checkinStops.length > 0) {
            const stopUUID = checkinStops.getItem(0).StopUUID;

            const checkinPayments = await clientAPI.read(
                service,
                "COCIPayments",
                [],
                `$filter=StopUUID eq guid'${stopUUID}' and PaymentType eq 'CA'`
            );

            // alert("CHECKIN CA payments found: " + checkinPayments.length);

            if (checkinPayments.length > 0) {
                const amt = Number(checkinPayments.getItem(0).Amount || 0);
                // alert("CHECKIN CA override amount: " + amt);
                return `Cash Collected : ${amt}`; // CHECKIN override
            }
        }

        // 2. VISIT STOPS → Collections → CollectionPayments
        const visitStops = await clientAPI.read(
            service,
            "Stops",
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'VISIT'`
        );

        // alert("VISIT stops found: " + visitStops.length);

        for (let i = 0; i < visitStops.length; i++) {
            const stopUUID = visitStops.getItem(i).StopUUID;
            // alert("Processing VISIT " + (i + 1) + " StopUUID: " + stopUUID);

            const collections = await clientAPI.read(
                service,
                "Collections",
                [],
                `$filter=StopUUID eq guid'${stopUUID}'`
            );

            // alert("Collections found: " + collections.length);

            for (let j = 0; j < collections.length; j++) {
                const collectionReadLink = collections.getItem(j)['@odata.readLink'];

                const payments = await clientAPI.read(
                    service,
                    `${collectionReadLink}/to_CollectionPayments`,
                    [],
                    ''
                );

                // alert("Payments in collection: " + payments.length);

                for (let k = 0; k < payments.length; k++) {
                    const payment = payments.getItem(k);

                    if (payment.PaymentType !== 'CA') {
                        // alert("Skipped non-CA payment");
                        continue;
                    }

                    const amt = Number(payment.Amount || 0);
                    // alert("Adding CA from VISIT Visit: " + (i + 1) + " Collection: " + (j + 1) + " Amount: " + amt + " Total before: " + totalAmount);
                    totalAmount += amt;
                    // alert("Total after: " + totalAmount);
                }
            }
        }

        // 3. CHECKOUT STOP → add CA
        const checkoutStops = await clientAPI.read(
            service,
            "Stops",
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKOUT'`
        );

        // alert("CHECKOUT Stops found: " + checkoutStops.length);

        if (checkoutStops.length > 0) {
            const stopUUID = checkoutStops.getItem(0).StopUUID;

            const checkoutPayments = await clientAPI.read(
                service,
                "COCIPayments",
                [],
                `$filter=StopUUID eq guid'${stopUUID}' and PaymentType eq 'CA'`
            );

            // alert("CHECKOUT CA payments found: " + checkoutPayments.length);

            for (let i = 0; i < checkoutPayments.length; i++) {
                const amt = Number(checkoutPayments.getItem(i).Amount || 0);
                // alert("Adding CA from CHECKOUT Amount: " + amt + " Total before: " + totalAmount);
                totalAmount += amt;
                // alert("Total after: " + totalAmount);
            }
        }

        // alert("FINAL TOTAL CA AMOUNT: " + totalAmount);
        //return `Cash Collected : ${totalAmount}`; 
        // =================================================
        // 4. DEPOSIT STOPS -> BANK DEPOSITS
        // =================================================

        let totalDeposited = 0;

        const depositStops =
            await clientAPI.read(
                service,
                "Stops",
                [],
                `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'DEPOSIT'`
            );

        for (
            let i = 0;
            i < depositStops.length;
            i++
        ) {

            const depositStop =
                depositStops.getItem(i);

            const stopReadLink =
                depositStop['@odata.readLink'];

            // Stop -> BankDeposits
            const bankDeposits =
                await clientAPI.read(
                    service,
                    `${stopReadLink}/to_BankDeposits`,
                    [],
                    ''
                );

            for (
                let j = 0;
                j < bankDeposits.length;
                j++
            ) {

                const bankDeposit =
                    bankDeposits.getItem(j);

                const amt =
                    Number(
                        bankDeposit.Amount || 0
                    );

                totalDeposited += amt;
            }
        }

        // =================================================
        // 5. FINAL REMAINING
        // =================================================

        let remainingAmount =
            totalAmount;

        if (totalDeposited > 0) {

            remainingAmount =
                totalAmount - totalDeposited;
        }

        return `Cash Collected : ${remainingAmount}`;

    } catch (err) {
        alert("Error: " + err.message);
        return totalAmount;
    }
}
