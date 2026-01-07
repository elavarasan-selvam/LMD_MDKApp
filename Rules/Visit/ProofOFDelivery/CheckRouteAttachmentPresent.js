/**
 * Check whether any attachment exists for the current Route
 * @param {IClientAPI} context
 */

//CheckRouteAttachmentPresent

/**
 * Read CONTENT details (MimeType, FileName) for attachments of current Route
 * @param {IClientAPI} context
 */
export default async function CheckRouteAttachmentPresent(context) {

  //  alert(' Reading CONTENT details for Route attachments');

    const pageProxy = context.getPageProxy();
    const binding = pageProxy.binding;
    const appCD = context.getAppClientData();

    // STEP 1: Get RouteUUID
    const routeUUID =
        appCD.currentRouteUUID ||
        binding?.RouteUUID;

    if (!routeUUID) {
      //  alert(' RouteUUID not found');
        return;
    }

    //alert(' RouteUUID: ' + routeUUID);

    try {
        // STEP 2: Read Attachments for this Route
        const attachmentResult = await context.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Attachments',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}'`
        );

        if (!attachmentResult || attachmentResult.length === 0) {
         //   alert(' No attachments found for this Route');
            return;
        }

       // alert(' Attachments found: ' + attachmentResult.length);

        // STEP 3: Loop attachments
        for (let i = 0; i < attachmentResult.length; i++) {

            const attachment = attachmentResult.getItem(i);
            const readLink = attachment['@odata.readLink'];
            const attachmentUUID = attachment.AttachmentUUID;
            const attachmentFileName = attachment.FileName;

        /*    alert(
                ' Attachment ' + (i + 1) + '\n' +
                'AttachmentUUID: ' + attachmentUUID + '\n' +
                'Attachment FileName: ' + attachmentFileName
            );

            */

            // STEP 4: Read CONTENT for this attachment
            const contentResult = await context.read(
                '/LMD_MDKApp/Services/LMD_MA.service',
                `${readLink}/to_Content`,
                [],
                ''
            );

            if (!contentResult || contentResult.length === 0) {
           
           //     alert(
            //        ' No CONTENT found for attachment\n' +
             //       'AttachmentUUID: ' + attachmentUUID
             //   ); 
                continue;
            }

           // alert(' Content records: ' + contentResult.length);

            // STEP 5: Loop content records
            for (let j = 0; j < contentResult.length; j++) {

                const content = contentResult.getItem(j);
                const contentMimeType = content.MimeType;
                const contentFileName = content.FileName;
                const contentReadLink = content['@odata.readLink'];

            /*    alert(
                    ' CONTENT ' + (j + 1) + '\n' +
                    'MimeType: ' + contentMimeType + '\n' +
                    'FileName: ' + contentFileName + '\n' +
                    'Content ReadLink: ' + contentReadLink
                );
            */

            }
        }

    } catch (e) {
     //   alert(' Error while reading content details: ' + e.message);
    }
}
