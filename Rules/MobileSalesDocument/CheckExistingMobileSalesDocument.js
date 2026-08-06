/**
 * @param {IClientAPI} context
 */
export default async function CheckExistingMobileSalesDocument(context) {

    try {

        const service = '/LMD_MDKApp/Services/LMD_MA.service';

        const appCD = context.getAppClientData();

        const currentStop =
            appCD.currentStop ||
            context.getPageProxy().binding ||
            context.binding;

        if (!currentStop || !currentStop.StopUUID) {
            throw new Error('Current Stop not found.');
        }

        const stopUUID = currentStop.StopUUID;

        const result = await context.read(
            service,
            'MobileSalesDocuments',
            [],
            `$filter=StopUUID eq guid'${stopUUID}'`
        );

        if (result && result.length > 0) {

            // Existing Mobile Sales Document
            const existingDocument = result.getItem(0);

            appCD.CurrentMobileSalesDocumentReadLink =
                existingDocument['@odata.readLink'];

            appCD.CurrentMobileSalesDocumentID =
                existingDocument.MobileSalesDocumentID;

            return context.executeAction(
                '/LMD_MDKApp/Actions/StartMyVisit/MobileSalesDocument/MobileSalesDocumentItems.action'
            );
        }

        // No Mobile Sales Document exists for this Stop
        return context.executeAction(
            '/LMD_MDKApp/Actions/StartMyVisit/MobileSalesDocument/MobileDocumentCreateRelatedEntity.action'
        );

    } catch (error) {

        context.getLogger().error(
            'CheckExistingMobileSalesDocument',
            error.message || error
        );

        return Promise.reject(error);
    }
}