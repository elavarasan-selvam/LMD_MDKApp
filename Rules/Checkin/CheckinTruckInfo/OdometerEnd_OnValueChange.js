export default function OdometerEnd_OnValueChange(clientAPI) {

    const appData = clientAPI.getAppClientData();

    const value = Number(clientAPI.getValue()) || 0;

    // Store latest value
    appData.Odometer_End = value;

    return true;
}
