/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function OdometerBegin_OnValueChange(clientAPI) {

    const appData = clientAPI.getAppClientData();

    const value = clientAPI.getValue();

    // Store latest value
    appData.OdometerBeginValue = value ? String(value) : "";

    return true;
}
