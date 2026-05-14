export default function GetRouteReadLink(clientAPI) {

    try {

        let routeUUID = clientAPI.getAppClientData().EarliestRouteUUID;

        if (!routeUUID) {
            alert("RouteUUID is missing");
            return "";
        }

        let readLink = `Routes(guid'${routeUUID}')`;

        //alert("Route ReadLink = " + readLink);

        return readLink;

    } catch (e) {
        alert("Error: " + e.message);
        return "";
    }
}