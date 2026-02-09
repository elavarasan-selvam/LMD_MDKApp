/**
 * Check ErrorArchive and confirm sync success
 * Save formatted Last Sync time
 * @param {IClientAPI} context
 */
export default async function CheckForSyncError(context) {

    const service = '/LMD_MDKApp/Services/LMD_MA.service';
    const pageProxy = context.getPageProxy();

    const clientData = pageProxy.getClientData();
    const appData = context.getAppClientData();


    // Date formatter
    function formatDate(date) {

        const months = ["Jan","Feb","Mar","Apr","May","Jun",
                        "Jul","Aug","Sep","Oct","Nov","Dec"];

        const d = date.getDate();
        const m = months[date.getMonth()];
        const y = date.getFullYear();

        let h = date.getHours();
        const min = date.getMinutes().toString().padStart(2, '0');

        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;

        return `${m} ${d}, ${y} ${h}:${min} ${ampm}`;
    }


    // If already retried
    if (clientData.hasRetriedSync) {

        const errorCount = await context.count(service, 'ErrorArchive', '');

        if (errorCount > 0) {

            await pageProxy.executeAction(
                '/LMD_MDKApp/Actions/ErrorArchive/ErrorArchive_SyncFailure.action'
            );

            return Promise.reject(false);
        }

        //  Success → Save time
        appData.LastSyncTime = formatDate(new Date());
        pageProxy.redraw();

        return;
    }


    // First check
    const errorCount = await context.count(service, 'ErrorArchive', '');

    if (errorCount > 0) {

        clientData.hasRetriedSync = true;

        // Retry upload
        await pageProxy.executeAction(
            '/LMD_MDKApp/Actions/LMD_MA/Service/UploadOffline.action'
        );

        // Retry download
        await pageProxy.executeAction(
            '/LMD_MDKApp/Actions/LMD_MA/Service/DownloadOffline.action'
        );

        const newErrorCount = await context.count(service, 'ErrorArchive', '');

        if (newErrorCount > 0) {

            await pageProxy.executeAction(
                '/LMD_MDKApp/Actions/ErrorArchive/ErrorArchive_SyncFailure.action'
            );

            return Promise.reject(false);
        }
    }


    //  Final success → Save time
    appData.LastSyncTime = formatDate(new Date());
    pageProxy.redraw();
}
