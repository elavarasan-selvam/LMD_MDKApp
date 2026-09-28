export default async function OnReturnRefresh(context) {

    const pageProxy = context.getPageProxy();
    const appData = context.getAppClientData();

    // Refresh page
    await pageProxy.redraw();

    // No save status
    if (!appData.ReloadSaveStatus) {
        return;
    }

    // Show banner on Reload Truck Load
    await context.executeAction(
        "/LMD_MDKApp/Actions/Reload_CheckIn/ReloadSaveStatusBanner.action"
    );

    // Clear status after showing banner
    appData.ReloadSaveStatus = null;
}