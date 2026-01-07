/**
 * Returns MimeType of first attachment for current Route (with alerts)
 * @param {IClientAPI} context
 */
export default async function GetRouteAttachmentMimeType(context) {

 //   alert(' Start: Read Route Attachment MimeType');

    const binding = context.binding;
    const appCD = context.getAppClientData();

    // STEP 1: Get RouteUUID
    const routeUUID =
        appCD.currentRouteUUID ||
        binding?.RouteUUID;

    if (!routeUUID) {
    //    alert(' RouteUUID not found');
        return "";
    }

  //  alert(' RouteUUID: ' + routeUUID);

    try {
        // STEP 2: Read Attachment entity
     //   alert(' Reading Attachments entity');

        const attachments = await context.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Attachments',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}'`
        );

        if (!attachments || attachments.length === 0) {
        //    alert(' No attachments found for this Route');
            return "";
        }

      //  alert(' Attachment count: ' + attachments.length);

        // STEP 3: Read ONLY MimeType
        const mimeType = attachments.getItem(0).MimeType;

      //  alert(' MimeType found: ' + mimeType);

        // STEP 4: Return MimeType only
        return mimeType || "";

    } catch (e) {
    //    alert(' Error while reading MimeType: ' + e.message);
        return "";
    }
}
