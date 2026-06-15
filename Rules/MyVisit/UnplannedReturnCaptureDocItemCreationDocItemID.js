/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default async function UnplannedReturnGenerateDocument(context) {
 
    const service = '/LMD_MDKApp/Services/LMD_MA.service';
 
    const appCD = context.getAppClientData();
 
    const currentStop =
        appCD.currentStop ||
        context.getPageProxy().binding ||
        context.binding;
 
    const routeUUID = currentStop.RouteUUID;
 
    const documents = await context.read(
        service,
        'DocumentItems',
        [],
        `$filter=IsReturn eq true and IsManuallyAdded eq true and RouteUUID eq guid'${routeUUID}'&$orderby=DocumentID desc&$top=1`
    );
 
    let nextDocumentID = 1;
 
    if (documents && documents.length > 0) {
 
        const latestDocument = documents.getItem(0);
 
        nextDocumentID = Number(latestDocument.DocumentID) + 1;
    }
 
    context.getPageProxy().getClientData().UnplannedReturnDocumentID = nextDocumentID.toString();
 
    // alert("Next Unplanned Return Document ID: " + nextDocumentID);
 
    return nextDocumentID.toString();
}
