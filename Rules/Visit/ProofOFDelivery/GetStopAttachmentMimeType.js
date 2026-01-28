/**
 * Read MimeType from Content entity for current Stop (via Document)
 * Attachment.ReferenceID == Document.DocumentID
 */
export default async function GetStopAttachmentMimeType(context) {
    try {
        const appCD = context.getAppClientData();
        const binding = context.getPageProxy().binding;

        const stopUUID =
            appCD.currentStop?.StopUUID ||
            binding?.StopUUID;

        if (!stopUUID) return '';

        const service = '/LMD_MDKApp/Services/LMD_MA.service';

        /* ---------------------------------------------------
           1️⃣ Read Document for this Stop
        --------------------------------------------------- */
        const documents = await context.read(
            service,
            'Documents',
            [],
            `$filter=StopUUID eq guid'${stopUUID}'`
        );

        if (!documents || documents.length === 0) return '';

        const documentID = documents.getItem(0).DocumentID;

        /* ---------------------------------------------------
           2️⃣ Read Attachment for this Document
        --------------------------------------------------- */
        const attachments = await context.read(
            service,
            'Attachments',
            [],
            `$filter=ReferenceID eq '${documentID}'`
        );

        if (!attachments || attachments.length === 0) return '';

        const attachment = attachments.getItem(0);
        const attachmentReadLink = attachment['@odata.readLink'];

        /* ---------------------------------------------------
           3️⃣ Read Content from Attachment
        --------------------------------------------------- */
        const contents = await context.read(
            service,
            `${attachmentReadLink}/to_Content`,
            [],
            ''
        );

        if (!contents || contents.length === 0) return '';

        return contents.getItem(0).MimeType;

    } catch (err) {
        return '';
    }
}
