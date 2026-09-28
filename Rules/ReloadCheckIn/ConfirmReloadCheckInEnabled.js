
export default async function ConfirmReloadCheckInEnabled(clientAPI) {

    const appData = clientAPI.getAppClientData();

    return appData.IsReloadCheckInConfirmEnabled === true;

}

  