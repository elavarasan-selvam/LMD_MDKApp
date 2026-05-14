export default function GetRouteValue(clientAPI) {

    try {

        let routeUUID = clientAPI.getAppClientData().EarliestRouteUUID;

        return routeUUID;

    } catch (e) {
        alert("Error: " + e.message);
        return "";
    }
}