/**
 * Describe this function...
 * @param {IClientAPI} context
 */
export default async function CheckForSyncError(context) {
    const service = '/LMD_MDKApp/Services/LMD_MA.service';
    const pageProxy = context.getPageProxy();

    // Use a flag in client data to ensure we retry only once per page load
    const clientData = pageProxy.getClientData();
    if (clientData.hasRetriedSync) {
        // Already retried, just check error archive
        const errorCount = await context.count(service, 'ErrorArchive', '');
        if (errorCount > 0) {
            await pageProxy.executeAction('/LMD_MDKApp/Actions/ErrorArchive/ErrorArchive_SyncFailure.action');
            return Promise.reject(false);
        }
        return;
    }

    // Check ErrorArchive
    const errorCount = await context.count(service, 'ErrorArchive', '');
    if (errorCount > 0) {
        clientData.hasRetriedSync = true; // mark as retried

        // Retry uploading failed entries once
        await pageProxy.executeAction('/LMD_MDKApp/Actions/LMD_MA/Service/UploadOffline.action');

        // Download offline data after upload
        await pageProxy.executeAction('/LMD_MDKApp/Actions/LMD_MA/Service/DownloadOffline.action');

        // Check ErrorArchive again
        const newErrorCount = await context.count(service, 'ErrorArchive', '');
        if (newErrorCount > 0) {
            // If still errors, show sync failure
            await pageProxy.executeAction('/LMD_MDKApp/Actions/ErrorArchive/ErrorArchive_SyncFailure.action');
            return Promise.reject(false);
        }
    }
}
