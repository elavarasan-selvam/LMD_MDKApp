/**
 * Get Attachment ReadLink for Route
 * Match Attachment.ReferenceID with Document.DocumentID (for current Stop)
 * @param {IClientAPI} clientAPI
 */
export default async function GetRouteAttachmentReadLinkByDocument(clientAPI) {
    try {
        // const alert = clientAPI.nativescript?.alert; // enable if needed

        const appCD = clientAPI.getAppClientData();
        const binding = clientAPI.getPageProxy().binding;

        const stopUUID = appCD.currentStop?.StopUUID || binding?.StopUUID;
        const routeUUID = appCD.currentRouteUUID || binding?.RouteUUID;

        if (!stopUUID || !routeUUID) {
            return '';
        }

        const service = '/LMD_MDKApp/Services/LMD_MA.service';

        /* ---------------------------------------------------
           1️⃣ Read Documents for this Stop
        --------------------------------------------------- */
        const documentsResult = await clientAPI.read(
            service,
            'Documents',
            [],
            `$filter=StopUUID eq guid'${stopUUID}'`
        );

        if (!documentsResult || documentsResult.length === 0) {
            return '';
        }

        const document = documentsResult.getItem(0);
        const documentID = document.DocumentID;

        if (!documentID) {
            return '';
        }

        /* ---------------------------------------------------
           2️⃣ Build Route ReadLink
        --------------------------------------------------- */
        const routeReadLink = `Routes(guid'${routeUUID}')`;

        /* ---------------------------------------------------
           3️⃣ Read Attachments for Route
        --------------------------------------------------- */
        const attachmentsResult = await clientAPI.read(
            service,
            `${routeReadLink}/to_Attachments`,
            [],
            ''
        );

        if (!attachmentsResult || attachmentsResult.length === 0) {
            return '';
        }

        /* ---------------------------------------------------
           4️⃣ Match ReferenceID with DocumentID
        --------------------------------------------------- */
        for (let i = 0; i < attachmentsResult.length; i++) {
            const attachment = attachmentsResult.getItem(i);
            const referenceID = attachment.ReferenceID;

            if (referenceID === documentID) {
                return attachment['@odata.readLink'];
            }
        }

        return '';
    } catch (err) {
        return '';
    }
}
