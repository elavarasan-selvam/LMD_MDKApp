/**
 * Download attachment and open it
 * @param {IClientAPI} context
 */
export default async function DownloadAndOpenAttachment(context) {

    try {
        // STEP 1: Download attachment
        await context.executeAction(
            '/LMD_MDKApp/Actions/StartMyVisit/DownloadAttachment.action'
        );

        // STEP 2: Open downloaded attachment
        await context.executeAction(
            '/LMD_MDKApp/Actions/StartMyVisit/OpenDownloadedAttachment.action'
        );

    } catch (e) {
        await context.executeAction({
            "_Type": "Action.Type.Message",
            "Message": "Failed to open attachment"
        });
    }
}
