export default async function CanCreateBankDeposit(context) {

    try {

        const service = '/LMD_MDKApp/Services/LMD_MA.service';

        const routeUUID =
            context.getAppClientData().EarliestRouteUUID;

        if (!routeUUID) {
            return false;
        }

        // =================================================
        // READ STOPS
        // =================================================

        const stopsResult = await context.read(
            service,
            'Stops',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}'`
        );

        if (!stopsResult || stopsResult.length === 0) {
            return false;
        }

        let anyVisitCompleted = false;

        let allVisitsCompleted = true;

        let checkinStarted = false;

        let totalCollected = 0;

        let totalDeposited = 0;

        // =================================================
        // LOOP STOPS
        // =================================================

        for (let i = 0; i < stopsResult.length; i++) {

            const stop = stopsResult.getItem(i);

            const stopType =
                (stop.StopType || '').toUpperCase();

            // =================================================
            // VISIT
            // =================================================

            if (stopType === 'VISIT') {

                const visitCompleted =
                    !!stop.EndDateTime;

                // any visit completed
                if (visitCompleted) {
                    anyVisitCompleted = true;
                }

                // any visit pending
                if (!visitCompleted) {
                    allVisitsCompleted = false;
                }

                // ---------------------------------------------
                // READ COLLECTIONS
                // ---------------------------------------------

                try {

                    const stopReadLink =
                        stop['@odata.readLink'];

                    // Stop -> Collections
                    const collectionsResult =
                        await context.read(
                            service,
                            `${stopReadLink}/to_Collections`,
                            [],
                            ''
                        );

                    if (
                        collectionsResult &&
                        collectionsResult.length > 0
                    ) {

                        for (
                            let c = 0;
                            c < collectionsResult.length;
                            c++
                        ) {

                            const collection =
                                collectionsResult.getItem(c);

                            const collectionReadLink =
                                collection['@odata.readLink'];

                            // Collections -> CollectionPayments
                            const paymentsResult =
                                await context.read(
                                    service,
                                    `${collectionReadLink}/to_CollectionPayments`,
                                    [],
                                    ''
                                );

                            if (
                                paymentsResult &&
                                paymentsResult.length > 0
                            ) {

                                for (
                                    let p = 0;
                                    p < paymentsResult.length;
                                    p++
                                ) {

                                    const payment =
                                        paymentsResult.getItem(p);

                                    const amount =
                                        Number(
                                            payment.Amount || 0
                                        );

                                    totalCollected += amount;
                                }
                            }
                        }
                    }

                } catch (e) {

                    // ignore collection errors
                }
            }

            // =================================================
            // CHECKIN
            // =================================================

            if (stopType === 'CHECKIN') {

                if (stop.StartDateTime) {
                    checkinStarted = true;
                }
            }

            // =================================================
            // DEPOSIT
            // =================================================

            if (stopType === 'DEPOSIT') {

                try {

                    const stopReadLink =
                        stop['@odata.readLink'];

                    // Stop -> BankDeposits
                    const depositResult =
                        await context.read(
                            service,
                            `${stopReadLink}/to_BankDeposits`,
                            [],
                            ''
                        );

                    if (
                        depositResult &&
                        depositResult.length > 0
                    ) {

                        for (
                            let j = 0;
                            j < depositResult.length;
                            j++
                        ) {

                            const deposit =
                                depositResult.getItem(j);

                            const amount =
                                Number(
                                    deposit.Amount ||
                                    deposit.DepositAmount ||
                                    deposit.TotalAmount ||
                                    deposit.AmountInTransactionCurrency ||
                                    0
                                );

                            totalDeposited += amount;
                        }
                    }

                } catch (e) {

                    // ignore deposit errors
                }
            }
        }

        // =================================================
        // CONDITIONS
        // =================================================

        // no completed visit
        if (!anyVisitCompleted) {
            return false;
        }

        // checkin started
        if (checkinStarted) {
            return false;
        }

        // all visits completed
        // and everything deposited
        if (
            allVisitsCompleted &&
            Number(totalDeposited) >= Number(totalCollected)
        ) {
            return false;
        }

        // otherwise enable
        return true;

    } catch (e) {

        alert(e.message);

        return false;
    }
}