/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function GetRouteUUID(clientAPI) {
 
    try {
 
        let routeUUID = clientAPI.getAppClientData().EarliestRouteUUID;
 
        return routeUUID;
 
    } catch (e) {
    //    alert("Error: " + e.message);
        return "";
    }
}
 
 