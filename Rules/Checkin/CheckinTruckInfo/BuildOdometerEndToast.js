export default function BuildOdometerEndToast(clientAPI) {

    const appData = clientAPI.getAppClientData();

    const value = appData.Odometer_End || 0;

    return `Odometer End updated to ${value}`;
}
