/**
 * Get CollectionPayment ReadLink for current Stop
 * @param {IClientAPI} clientAPI
 */
export default async function GetCollectionPaymentReadLink(clientAPI) {
    try {
        const appCD = clientAPI.getAppClientData();
        const stopRef = appCD.currentStop || clientAPI.getPageProxy().binding;

        if (!stopRef || !stopRef.StopUUID) {
            alert('StopUUID missing');
            return '';
        }

        const stopUUID = stopRef.StopUUID;
        const service = '/LMD_MDKApp/Services/LMD_MA.service';

        // 1 Read Collection for Stop
        const collections = await clientAPI.read(
            service,
            'Collections',
            [],
            `$filter=StopUUID eq guid'${stopUUID}'`
        );

        if (!collections || collections.length === 0) {
            alert('No Collection found for this Stop');
            return '';
        }

        const collection = collections.getItem(0);
        const collectionReadLink = collection['@odata.readLink'];

        //alert('Collection ReadLink:\n' + collectionReadLink);

        //  Read CollectionPayments from Collection
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

        const payment = payments.getItem(0);
        const paymentReadLink = payment['@odata.readLink'];

        //alert('CollectionPayment ReadLink:\n' + paymentReadLink);

        // Store if needed later
        appCD.CollectionPaymentReadLink = paymentReadLink;

        return paymentReadLink;

    } catch (err) {
        alert('Error: ' + err.message);
        return '';
    }
}
