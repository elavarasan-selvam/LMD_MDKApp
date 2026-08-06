/**
 * @param {IClientAPI} context
 */
export default async function GetMobileSalesDocumentID(context) {

    const service = '/LMD_MDKApp/Services/LMD_MA.service';

    const appCD = context.getAppClientData();

    const currentStop =
        appCD.currentStop ||
        context.getPageProxy().binding ||
        context.binding;

    const routeUUID = currentStop.RouteUUID;

    const documents = await context.read(
        service,
        'MobileSalesDocuments',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}'&$orderby=MobileSalesDocumentID desc&$top=1`
    );

    let nextDocumentID = 1;

    if (documents && documents.length > 0) {

        const latestDocument = documents.getItem(0);

        nextDocumentID =
            Number(latestDocument.MobileSalesDocumentID) + 1;
    }
alert(`Next MobileSalesDocumentID: ${nextDocumentID}`); 
    return nextDocumentID.toString();
}