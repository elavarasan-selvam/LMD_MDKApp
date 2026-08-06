/**
 * @param {IClientAPI} context
 */
export default function AfterMobileSalesDocumentCreated(context) {

    const appCD = context.getAppClientData();

    const result = context.getActionResult('MobileDocumentCreateRelatedEntity');

    if (result && result.data) {
        appCD.CurrentMobileSalesDocumentReadLink =
            result.data['@odata.readLink'];

        appCD.CurrentMobileSalesDocumentID =
            result.data.MobileSalesDocumentID;
    }

    return context.executeAction(
        '/LMD_MDKApp/Actions/StartMyVisit/MobileSalesDocument/MobileSalesDocumentItems.action'
    );
}