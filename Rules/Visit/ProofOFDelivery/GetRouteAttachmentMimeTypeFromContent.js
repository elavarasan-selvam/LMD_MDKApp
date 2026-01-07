/**
 * Read CONTENT entity and return MimeType for current Route (with alerts)
 * @param {IClientAPI} context
 */
export default async function GetRouteAttachmentMimeTypeFromContent(context) {

 //   alert(' Start: Read MimeType from CONTENT entity');

    const pageProxy = context.getPageProxy();
    const binding = pageProxy.binding;
    const appCD = context.getAppClientData();

    // STEP 1: Get RouteUUID
    const routeUUID =
        appCD.currentRouteUUID ||
        binding?.RouteUUID;

    if (!routeUUID) {
      //  alert(' RouteUUID not found');
        return "";
    }

   // alert(' RouteUUID: ' + routeUUID);

    try {
        // STEP 2: Read Attachments for Route
       // alert(' Reading Attachments');

        const attachments = await context.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Attachments',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}'`
        );

        if (!attachments || attachments.length === 0) {
         //   alert(' No attachments found');
            return "";
        }

       // alert(' Attachment count: ' + attachments.length);

        // STEP 3: Take first Attachment ReadLink
        const attachment = attachments.getItem(0);
        const attachmentReadLink = attachment['@odata.readLink'];

       // alert(' Attachment ReadLink:\n' + attachmentReadLink);

        // STEP 4: Read CONTENT entity via navigation
       // alert(' Reading CONTENT entity');

        const contents = await context.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            `${attachmentReadLink}/to_Content`,
            [],
            ''
        );

        if (!contents || contents.length === 0) {
        //    alert(' No CONTENT records found');
            return "";
        }

      //  alert(' Content count: ' + contents.length);

        // STEP 5: Get MimeType from Content
        const mimeType = contents.getItem(0).MimeType;

       // alert(' MimeType found: ' + mimeType);

        // STEP 6: Return MimeType only
        return mimeType || "";

    } catch (e) {
     //   alert(' Error while reading CONTENT MimeType: ' + e.message);
        return "";
    }
}
