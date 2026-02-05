/**
 * Get CONTENT for attachments of current Stop (via Document)
 * Returns content metadata if present, otherwise null
 */
export default async function GetStopAttachmentContent(context) {
    try {
        const pageProxy = context.getPageProxy();
        const binding = pageProxy.binding;
        const appCD = context.getAppClientData();

        /* ---------------------------------------------------
           1️⃣ Get StopUUID
        --------------------------------------------------- */
        const stopUUID =
            appCD.currentStop?.StopUUID ||
            binding?.StopUUID;

        if (!stopUUID) return null;

        const service = '/LMD_MDKApp/Services/LMD_MA.service';

        /* ---------------------------------------------------
           2️⃣ Read Document for this Stop
        --------------------------------------------------- */
        const documents = await context.read(
            service,
            'Documents',
            [],
            `$filter=StopUUID eq guid'${stopUUID}'`
        );

        if (!documents || documents.length === 0) return null;

        const documentID = documents.getItem(0).DocumentID;

        /* ---------------------------------------------------
           3️⃣ Read Attachments for this Document
        --------------------------------------------------- */
        const attachments = await context.read(
            service,
            'Attachments',
            [],
            `$filter=ReferenceID eq '${documentID}'`
        );

        if (!attachments || attachments.length === 0) return null;

        /* ---------------------------------------------------
           4️⃣ Read CONTENT for attachments
        --------------------------------------------------- */
        for (let i = 0; i < attachments.length; i++) {
            const attachment = attachments.getItem(i);
            const attachmentReadLink = attachment['@odata.readLink'];

            const contents = await context.read(
                service,
                `${attachmentReadLink}/to_Content`,
                [],
                ''
            );

            if (contents && contents.length > 0) {
                const content = contents.getItem(0);
                return {
                    ContentReadLink: content['@odata.readLink'],
                    FileName: content.FileName,
                    MimeType: content.MimeType
                };
            }
        }

        return null;

    } catch (e) {
        return null;
    }
}
