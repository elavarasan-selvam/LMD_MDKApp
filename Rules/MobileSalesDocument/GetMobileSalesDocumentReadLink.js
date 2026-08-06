/**
 * @param {IClientAPI} context
 */
export default async function GetMobileSalesDocumentReadLink(context) {

    const service = "/LMD_MDKApp/Services/LMD_MA.service";

    const appCD = context.getAppClientData();

    const currentStop =
        appCD.currentStop ||
        context.getPageProxy().binding ||
        context.binding;

    const stopUUID = currentStop.StopUUID;

    const result = await context.read(
        service,
        "MobileSalesDocuments",
        [],
        `$filter=StopUUID eq guid'${stopUUID}'&$orderby=MobileSalesDocumentID desc`
    );

    if (result && result.length > 0) {
    //    alert(`MobileSalesDocumentReadLink: ${result.getItem(0)['@odata.readLink']}`);
    //    alert(`MobileSalesDocumentID: ${result.getItem(0).MobileSalesDocumentID}`);
        return result.getItem(0)['@odata.readLink'];
    }

    return "";
}