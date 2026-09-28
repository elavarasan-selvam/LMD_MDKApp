export default function IsReloadCheckInConfirmEnabled(clientAPI) {

    const appData = clientAPI.getAppClientData();

    const result =
        appData.IsReloadCheckInConfirmEnabled === true;

    return result;
}