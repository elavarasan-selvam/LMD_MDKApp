/**
 * Read MimeType from Content entity for current Route
 * @param {IClientAPI} context
 */
export default async function GetRouteAttachmentMimeType(context) {

    const appCD = context.getAppClientData();
    const binding = context.getPageProxy().binding;

    const routeUUID =
        appCD.currentRouteUUID ||
        binding?.RouteUUID;

    if (!routeUUID) {
    //    alert(' RouteUUID not found');
        return;
    }

    // 1️⃣ Read Attachments
    const attachments = await context.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'Attachments',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}'`
    );

    if (!attachments || attachments.length === 0) {
    //    alert(' No attachments');
        return;
    }

    // 2️⃣ Read Content
    const attachment = attachments.getItem(0);
    const readLink = attachment['@odata.readLink'];

    const contents = await context.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        `${readLink}/to_Content`,
        [],
        ''
    );

    if (!contents || contents.length === 0) {
      //  alert(' No content records');
        return;
    }

    // 3️⃣ Get MimeType
    const mimeType = contents.getItem(0).MimeType;

  //  alert(' MimeType: ' + mimeType);

    return mimeType;
}
