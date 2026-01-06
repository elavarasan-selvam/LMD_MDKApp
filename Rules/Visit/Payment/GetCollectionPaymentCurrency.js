/**
 * Returns Currency of first CollectionPayment with Amount > 0
 * Uses CollectionReadLink directly
 */
export default async function GetCollectionPaymentCurrency(clientAPI) {
    try {
        const appCD = clientAPI.getAppClientData();
        const collectionReadLink = appCD.CollectionReadLink;

        if (!collectionReadLink) {
            alert('CollectionReadLink missing');
            return '';
        }

        const service = '/LMD_MDKApp/Services/LMD_MA.service';

        // Read payments via navigation property
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

        // Pick first payment with Amount > 0
        const payment = payments.find(p => Number(p.Amount) > 0);

        if (!payment) {
            alert('Payments exist but Amount is 0');
            return '';
        }

        // Return Currency
        const currency = payment.Currency || payment.CurrencyCode || '';
        return currency;

    } catch (e) {
        alert('Error: ' + e.message);
        return '';
    }
}
