/**
 * Get Attachment ReadLink for Route
 * Match Attachment.ReferenceID with Document.DocumentID (for current Stop)
 * @param {IClientAPI} clientAPI
 */
export default async function GetRouteAttachmentReadLinkByDocument(clientAPI) {
    try {
      //  alert(' Rule started: GetRouteAttachmentReadLinkByDocument');

        const appCD = clientAPI.getAppClientData();
        const binding = clientAPI.getPageProxy().binding;

        const stopUUID = appCD.currentStop?.StopUUID || binding?.StopUUID;
        const routeUUID = appCD.currentRouteUUID || binding?.RouteUUID;

        if (!stopUUID || !routeUUID) {
        //    alert(' StopUUID or RouteUUID missing');
            return '';
        }

       // alert(` StopUUID: ${stopUUID}`);
       // alert(` RouteUUID: ${routeUUID}`);

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
        //    alert('⚠ No Documents found for this Stop');
            return '';
        }

        const document = documentsResult.getItem(0);
        const documentID = document.DocumentID;

     //   alert(` DocumentID found: ${documentID}`);

        /* ---------------------------------------------------
           2️⃣ Build Route ReadLink
        --------------------------------------------------- */
        const routeReadLink = `Routes(guid'${routeUUID}')`;
       // alert(` Route ReadLink: ${routeReadLink}`);

        /* ---------------------------------------------------
           3️⃣ Read Attachments for Route
        --------------------------------------------------- */
        const attachmentsResult = await clientAPI.read(
            service,
            `${routeReadLink}/to_Attachments`,
            [],
            ''
        );

        // alert(` Attachments found: ${attachmentsResult.length}`);

        /* ---------------------------------------------------
           4️⃣ Match ReferenceID with DocumentID
        --------------------------------------------------- */
        for (let i = 0; i < attachmentsResult.length; i++) {
            const attachment = attachmentsResult.getItem(i);
            const referenceID = attachment.ReferenceID;

           // alert(` Checking Attachment ReferenceID: ${referenceID}`);

            if (referenceID === documentID) {
                const attachmentReadLink = attachment['@odata.readLink'];
             //   alert(` Matching Attachment ReadLink:\n${attachmentReadLink}`);
                return attachmentReadLink;
            }
        }

       // alert(' No matching Attachment found for this DocumentID');
        return '';

    } catch (err) {
       // alert(' Error in GetRouteAttachmentReadLinkByDocument: ' + err.message);
        return '';
    }
}
