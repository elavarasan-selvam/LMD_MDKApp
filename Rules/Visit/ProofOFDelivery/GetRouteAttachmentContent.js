/**
 * Get CONTENT for attachments of current Route
 * Returns content metadata if present, otherwise null
 * @param {IClientAPI} context
 * @returns {Promise<Object|null>}
 */
export default async function GetRouteAttachmentContent(context) {

    const pageProxy = context.getPageProxy();
    const binding = pageProxy.binding;
    const appCD = context.getAppClientData();

    // STEP 1: Get RouteUUID
    const routeUUID =
        appCD.currentRouteUUID ||
        binding?.RouteUUID;

    if (!routeUUID) {
        return null;
    }

    try {
        // STEP 2: Read Attachments for Route
        const attachmentResult = await context.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Attachments',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}'`
        );

        if (!attachmentResult || attachmentResult.length === 0) {
            return null;
        }

        // STEP 3: Loop attachments
        for (let i = 0; i < attachmentResult.length; i++) {

            const attachment = attachmentResult.getItem(i);
            const attachmentReadLink = attachment['@odata.readLink'];

            // STEP 4: Read CONTENT for attachment
            const contentResult = await context.read(
                '/LMD_MDKApp/Services/LMD_MA.service',
                `${attachmentReadLink}/to_Content`,
                [],
                ''
            );

            if (contentResult && contentResult.length > 0) {

                // Take first content (usually one)
                const content = contentResult.getItem(0);

                // RETURN content metadata
                return {
                    ContentReadLink: content['@odata.readLink'],
                    FileName: content.FileName,
                    MimeType: content.MimeType
                };
            }
        }

        // No content found
        return null;

    } catch (e) {
        return null;
    }
}
