/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function UpdateOdometerEndReadLink(clientAPI) {
    //alert(JSON.stringify(clientAPI.getPageProxy().binding));
    return clientAPI.getPageProxy().binding['@odata.readLink'];
    //return 'Routes(' + clientAPI.binding.RouteUUID + ')';
    
 
}
