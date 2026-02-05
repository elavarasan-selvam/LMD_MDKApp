/**
 * Read MimeType from Content entity for current Route
 * @param {IClientAPI} context
 */
export default async function GetRouteAttachmentMimeType(context) {
    try {
        const appCD = context.getAppClientData();
        const binding = context.getPageProxy().binding;

        const routeUUID = appCD.currentRouteUUID || binding?.RouteUUID;
        if (!routeUUID) {
            return '';
        }

        const service = '/LMD_MDKApp/Services/LMD_MA.service';

        /* ---------------------------------------------------
           1️⃣ Read Attachments for this Route
        --------------------------------------------------- */
        const attachments = await context.read(
            service,
            'Attachments',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}'`
        );

        if (!attachments || attachments.length === 0) {
            return '';
        }

        /* ---------------------------------------------------
           2️⃣ Read Content for first Attachment
        --------------------------------------------------- */
        const attachment = attachments.getItem(0);
        const readLink = attachment['@odata.readLink'];

        if (!readLink) {
            return '';
        }

        const contents = await context.read(
            service,
            `${readLink}/to_Content`,
            [],
            ''
        );

        if (!contents || contents.length === 0) {
            return '';
        }

        /* ---------------------------------------------------
           3️⃣ Return MimeType
        --------------------------------------------------- */
        return contents.getItem(0).MimeType || '';
    } catch (err) {
        return '';
    }
}
