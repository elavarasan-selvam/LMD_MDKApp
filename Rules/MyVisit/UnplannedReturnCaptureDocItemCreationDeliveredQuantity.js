/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default async function UnplannedReturnCaptureDocItemCreationsDeliveredQuantity(context) {
    const service = '/LMD_MDKApp/Services/LMD_MA.service';
const DocID = context.getPageProxy().getClientData().DocumentID;
const document = await context.read(
            service,
            'DocumentItems',
            [],
            `$filter=DocumentID eq '${DocID}'`
        );
if (!document || document.length === 0) {
            return '';
        }
const delivered = document.getItem(0).DeliveredQuantity;
return delivered; 
}
