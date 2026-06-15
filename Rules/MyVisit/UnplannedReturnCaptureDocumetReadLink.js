/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default async function UnplannedReturnCaptureDocumetReadLink(context) {
    const service = '/LMD_MDKApp/Services/LMD_MA.service';
//const DocID = context.getPageProxy().getClientData().DocumentID;
//alert(DocID);
const appCD = context.getAppClientData();
        const currentStop =
            appCD.currentStop ||
            context.getPageProxy().binding ||
            context. Binding;
const routeUUID = currentStop.RouteUUID;
const stopUUID = currentStop.StopUUID;
const document = await context.read(
            service,
            'Documents',
            [],
            `$filter=IsReturn eq true and IsManuallyAdded eq true and StopUUID eq guid'${stopUUID}' and RouteUUID eq guid'${routeUUID}'&$orderby=DocumentID desc&$top=1`
        );
     //   alert("list" + JSON.stringify(document));
if (!document || document.length === 0) {
    //alert('No document found');
            return '';
        }
        const docs = document.getItem(0);
       // alert("docs" + JSON.stringify(docs));
       //   alert("readlink" + docs['@odata.readLink']);
 return docs['@odata.readLink'];
}
