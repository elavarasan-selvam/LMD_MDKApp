export default function GetRouteUUID(clientAPI) {

    let routeUUID = clientAPI.getAppClientData().RouteUUID 
                  || clientAPI.getAppClientData().EarliestRouteUUID;

    return routeUUID;
}