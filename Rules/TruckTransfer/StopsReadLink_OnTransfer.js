/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function StopsReadLink_OnTransfer(clientAPI) {
    const stopUUID = clientAPI.getAppClientData().CurrentStopUUID;
    let readlink = `Stops(guid'${stopUUID}')`;
    return readlink;
}
