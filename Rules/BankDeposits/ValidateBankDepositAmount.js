export default async function ValidateBankDepositAmount(clientAPI) {

    const pageProxy = clientAPI.getPageProxy();

    const referenceControl =
        pageProxy.evaluateTargetPath(
            "#Page:CreateBankDeposits/#Control:BankDepositReferencenumber"
        );

    const accountControl =
        pageProxy.evaluateTargetPath(
            "#Page:CreateBankDeposits/#Control:FormCellListPicker0"
        );

    const amountControl =
        pageProxy.evaluateTargetPath(
            "#Page:CreateBankDeposits/#Control:BankDepositAmount"
        );

    const reference =
        referenceControl.getValue();

    const account =
        accountControl.getValue();

    let enteredAmount =
        amountControl.getValue();

    enteredAmount =
        enteredAmount !== ''
            ? Number(enteredAmount)
            : NaN;

    let isValid = true;

    // =========================================
    // REFERENCE NUMBER VALIDATION
    // =========================================

    if (!reference || reference.trim() === '') {

        referenceControl.setValidationProperty(
            "ValidationMessage",
            "Reference Number is required."
        );

        referenceControl.setValidationProperty(
            "ValidationViewIsHidden",
            false
        );

        referenceControl.redraw();

        isValid = false;

    } else {

        referenceControl.clearValidation();
        referenceControl.redraw();
    }

    // =========================================
    // DEPOSIT ACCOUNT VALIDATION
    // =========================================

    if (!account || account.length === 0) {

        accountControl.setValidationProperty(
            "ValidationMessage",
            "Please select a Deposit Account."
        );

        accountControl.setValidationProperty(
            "ValidationViewIsHidden",
            false
        );

        accountControl.redraw();

        isValid = false;

    } else {

        accountControl.clearValidation();
        accountControl.redraw();
    }

    // =========================================
    // AMOUNT MANDATORY VALIDATION
    // =========================================

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

        isValid = false;

    } else {

        amountControl.clearValidation();
        amountControl.redraw();
    }

    // Stop further processing if mandatory validations fail
    if (!isValid) {
        return false;
    }

    const routeUUID =
        clientAPI.getAppClientData().EarliestRouteUUID;

    const service =
        "/LMD_MDKApp/Services/LMD_MA.service";

    let totalCollected = 0;
    let totalDeposited = 0;

    try {

        // =========================================
        // VISIT STOPS -> COLLECTIONS -> PAYMENTS
        // =========================================

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

                    if (payment.PaymentType !== 'CA') {
                        continue;
                    }

                    totalCollected +=
                        Number(payment.Amount || 0);
                }
            }
        }

        // =========================================
        // DEPOSIT STOPS -> BANK DEPOSITS
        // =========================================

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

                totalDeposited +=
                    Number(bankDeposit.Amount || 0);
            }
        }

        // =========================================
        // REMAINING AMOUNT
        // =========================================

        const remainingAmount =
            totalCollected - totalDeposited;

        // =========================================
        // REMAINING AMOUNT VALIDATION
        // =========================================

        if (enteredAmount > remainingAmount) {

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

        // =========================================
        // SUCCESS
        // =========================================

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