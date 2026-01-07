/**
 * Read attachments for current Route and return attachment ReadLinks
 * @param {IClientAPI} context
 */
export default async function GetRouteAttachmentReadLinks(context) {

 //   alert(' Start: Reading attachment ReadLinks');

    const binding = context.binding;
    const appCD = context.getAppClientData();

    // STEP 1: Get RouteUUID
    const routeUUID =
        appCD.currentRouteUUID ||
        binding?.RouteUUID;

    if (!routeUUID) {
   //     alert(' RouteUUID not found');
        return [];
    }

   // alert(' RouteUUID: ' + routeUUID);

    try {
        // STEP 2: Read Attachments (ONLY attachment entity)
        const attachments = await context.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Attachments',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}'`
        );

        if (!attachments || attachments.length === 0) {
         //   alert(' No attachments found');
            return [];
        }

     //   alert(' Attachment count: ' + attachments.length);

        // STEP 3: Collect ReadLinks
        const readLinks = [];

        for (let i = 0; i < attachments.length; i++) {
            const attachment = attachments.getItem(i);
            const readLink = attachment['@odata.readLink'];

         //   alert(` Attachment ${i + 1} ReadLink:\n${readLink}`);

            if (readLink) {
                readLinks.push(readLink);
            }
        }

        return readLinks;

    } catch (e) {
     //   alert(' Error while reading attachments: ' + e.message);
        return [];
    }
}
