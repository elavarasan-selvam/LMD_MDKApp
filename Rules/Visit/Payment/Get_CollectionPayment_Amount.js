/**
 * Returns Amount if any CollectionPayment exists with Amount > 0
 * Uses CollectionReadLink directly (no extraction)
 */
export default async function GetCollectionPaymentAmount(clientAPI) {
    try {
        const appCD = clientAPI.getAppClientData();
        const collectionReadLink = appCD.CollectionReadLink;

        if (!collectionReadLink) {
            alert('CollectionReadLink missing');
            return '';
        }

        //alert('CollectionReadLink:\n' + collectionReadLink);

        const service = '/LMD_MDKApp/Services/LMD_MA.service';

        // Read payments via navigation
        const payments = await clientAPI.read(
            service,
            `${collectionReadLink}/to_CollectionPayments`,
            [],
            ''
        );

        if (!payments || payments.length === 0) {
            alert('No CollectionPayments found');
            return '';
        }

        // Check if any payment has Amount > 0
        const payment = payments.find(p => Number(p.Amount) > 0);

        if (!payment) {
            alert('Payments exist but Amount is 0');
            return '';
        }

        //alert('Payment Amount: ' + payment.Amount);
        return payment.Amount;

    } catch (e) {
        alert('Error: ' + e.message);
        return '';
    }
}
