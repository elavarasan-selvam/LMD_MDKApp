/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */

export default function ReturnUpdatereadlink(clientAPI) {
//  alert(JSON.stringify(clientAPI.getPageProxy().binding));
    return clientAPI.getPageProxy().binding['@odata.readLink'];
}
