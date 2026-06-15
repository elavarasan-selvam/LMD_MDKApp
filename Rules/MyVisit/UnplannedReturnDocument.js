/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default async function UnplannedReturnDocument(context){
 
    const service = '/LMD_MDKApp/Services/LMD_MA.service';
 
    const appCD = context.getAppClientData();
 
    const currentStop =
        appCD.currentStop ||
        context.getPageProxy().binding ||
        context.binding;
 
    const routeUUID = currentStop.RouteUUID;
 
    const document = await context.read(
        service,
        'Documents',
        [],
        `$filter=IsReturn eq true and IsManuallyAdded eq true and RouteUUID eq guid'${routeUUID}'&$orderby=DocumentID desc&$top=1`
    );
 
    if (!document || document.length === 0) {
        return '';
    }
 
    const docs = document.getItem(0);
 
    const documentID = docs.DocumentID;
 
    context.getPageProxy().getClientData().UnplannedReturnDocumentID = documentID;
 
    //alert("Latest Document ID: " + documentID);
 
    return documentID;
}