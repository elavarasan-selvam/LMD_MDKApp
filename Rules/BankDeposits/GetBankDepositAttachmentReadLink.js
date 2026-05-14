export default async function GetBankDepositAttachmentReadLink(clientAPI) {

    try {

        const routeUUID = clientAPI.getAppClientData().EarliestRouteUUID;

        if (!routeUUID) {
            return '';
        }

        const service =
            '/LMD_MDKApp/Services/LMD_MA.service';

        /* ---------------------------------------------------
           1️ Read DEPOSIT Stops from Route
        --------------------------------------------------- */

        const routeReadLink =
            `Routes(guid'${routeUUID}')`;

        const stopsResult =
            await clientAPI.read(
                service,
                `${routeReadLink}/to_Stops`,
                [],
                `$filter=StopType eq 'DEPOSIT'`
            );

        if (
            !stopsResult ||
            stopsResult.length === 0
        ) {

            return '';
        }

        /* ---------------------------------------------------
           2️ Get BankDepositID from Stop -> BankDeposits
        --------------------------------------------------- */

        let bankDepositID = '';

        for (let i = 0; i < stopsResult.length; i++) {

            const stop =
                stopsResult.getItem(i);

            const stopReadLink =
                stop['@odata.readLink'];

            // Stop -> BankDeposits
            const bankDepositsResult =
                await clientAPI.read(
                    service,
                    `${stopReadLink}/to_BankDeposits`,
                    [],
                    ''
                );

            if (
                bankDepositsResult &&
                bankDepositsResult.length > 0
            ) {

                const bankDeposit =
                    bankDepositsResult.getItem(0);

                bankDepositID =
                    bankDeposit.BankDepositID;

                if (bankDepositID) {
                    break;
                }
            }
        }

        if (!bankDepositID) {
            return '';
        }

        /* ---------------------------------------------------
           3️ Read Route Attachments
        --------------------------------------------------- */

        const attachmentsResult =
            await clientAPI.read(
                service,
                `${routeReadLink}/to_Attachments`,
                [],
                `$filter=AttachmentKind eq 'BDP'`
            );

        if (
            !attachmentsResult ||
            attachmentsResult.length === 0
        ) {

            return '';
        }

        /* ---------------------------------------------------
           4️ Match ReferenceID = BankDepositID
        --------------------------------------------------- */

        for (
            let i = 0;
            i < attachmentsResult.length;
            i++
        ) {

            const attachment =
                attachmentsResult.getItem(i);

            const referenceID =
                attachment.ReferenceID;

            if (
                referenceID === bankDepositID
            ) {

                return attachment[
                    '@odata.readLink'
                ];
            }
        }

        return '';

    } catch (err) {

        return '';
    }
}