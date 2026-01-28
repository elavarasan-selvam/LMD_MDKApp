/**
 * Get Attachment ReadLink for current Stop via Document
 * Attachment.ReferenceID == Document.DocumentID
 */
export default async function GetStopAttachmentReadLinkByDocument(clientAPI) {
    try {
        const appCD = clientAPI.getAppClientData();
        const binding = clientAPI.getPageProxy().binding;

        const stopUUID =
            appCD.currentStop?.StopUUID ||
            binding?.StopUUID;

        if (!stopUUID) {
            return '';
        }

        const service = '/LMD_MDKApp/Services/LMD_MA.service';

        /* ---------------------------------------------------
           1️⃣ Read Documents for this Stop
        --------------------------------------------------- */
        const documents = await clientAPI.read(
            service,
            'Documents',
            [],
            `$filter=StopUUID eq guid'${stopUUID}'`
        );

        if (!documents || documents.length === 0) {
            return '';
        }

        const documentID = documents.getItem(0).DocumentID;

        /* ---------------------------------------------------
           2️⃣ Read Attachments from DOCUMENT (not Route)
        --------------------------------------------------- */
        const attachments = await clientAPI.read(
            service,
            'Attachments',
            [],
            `$filter=ReferenceID eq '${documentID}'`
        );

        if (!attachments || attachments.length === 0) {
            return '';
        }

        const attachment = attachments.getItem(0);
        return attachment['@odata.readLink'];

    } catch (err) {
        return '';
    }
}
