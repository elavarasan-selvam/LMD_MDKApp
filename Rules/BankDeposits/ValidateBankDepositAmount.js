export default async function ValidateBankDepositAmount(clientAPI) {

    const pageProxy =
        clientAPI.getPageProxy();

    const amountControl =
        pageProxy.evaluateTargetPath(
            "#Page:CreateBankDeposits/#Control:BankDepositAmount"
        );

    let enteredAmount =
        amountControl.getValue();

    enteredAmount =
        enteredAmount !== ''
            ? Number(enteredAmount)
            : NaN;

    const routeUUID = clientAPI.getAppClientData().EarliestRouteUUID;

    const service =
        "/LMD_MDKApp/Services/LMD_MA.service";

    let totalCollected = 0;

    let totalDeposited = 0;

    try {

        // =================================================
        // VISITS -> COLLECTIONS -> COLLECTION PAYMENTS
        // =================================================

        const visitStops =
            await clientAPI.read(
                service,
                "Stops",
                [],
                `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'VISIT'`
            );

        for (let i = 0; i < visitStops.length; i++) {

            const stop =
                visitStops.getItem(i);

            const stopReadLink =
                stop['@odata.readLink'];

            // Stop -> Collections
            const collections =
                await clientAPI.read(
                    service,
                    `${stopReadLink}/to_Collections`,
                    [],
                    ''
                );

            for (let j = 0; j < collections.length; j++) {

                const collectionReadLink =
                    collections.getItem(j)['@odata.readLink'];

                // Collections -> CollectionPayments
                const payments =
                    await clientAPI.read(
                        service,
                        `${collectionReadLink}/to_CollectionPayments`,
                        [],
                        ''
                    );

                for (let k = 0; k < payments.length; k++) {

                    const payment =
                        payments.getItem(k);

                    if (
                        payment.PaymentType !== 'CA'
                    ) {
                        continue;
                    }

                    totalCollected += Number(
                        payment.Amount || 0
                    );
                }
            }
        }

        // =================================================
        // DEPOSITS -> BANK DEPOSITS
        // =================================================

        const depositStops =
            await clientAPI.read(
                service,
                "Stops",
                [],
                `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'DEPOSIT'`
            );

        for (let i = 0; i < depositStops.length; i++) {

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

            for (let j = 0; j < bankDeposits.length; j++) {

                const bankDeposit =
                    bankDeposits.getItem(j);

                totalDeposited += Number(
                    bankDeposit.Amount || 0
                );
            }
        }

        // =================================================
        // REMAINING
        // =================================================

        const remainingAmount =
            totalCollected - totalDeposited;

        // =================================================
        // VALIDATION
        // =================================================

        if (
            isNaN(enteredAmount) ||
            enteredAmount <= 0
        ) {

            amountControl.setValidationProperty(
                "ValidationMessage",
                "Enter valid amount."
            );

            amountControl.setValidationProperty(
                "ValidationViewIsHidden",
                false
            );

            amountControl.redraw();

            return false;
        }

        if (
            enteredAmount > remainingAmount
        ) {

            amountControl.setValidationProperty(
                "ValidationMessage",
                `Amount cannot exceed remaining amount (${remainingAmount}).`
            );

            amountControl.setValidationProperty(
                "ValidationViewIsHidden",
                false
            );

            amountControl.redraw();

            return false;
        }

        // =================================================
        // VALID
        // =================================================

        amountControl.clearValidation();

        amountControl.redraw();

        return true;

    } catch (e) {

        amountControl.setValidationProperty(
            "ValidationMessage",
            e.message
        );

        amountControl.setValidationProperty(
            "ValidationViewIsHidden",
            false
        );

        amountControl.redraw();

        return false;
    }
}