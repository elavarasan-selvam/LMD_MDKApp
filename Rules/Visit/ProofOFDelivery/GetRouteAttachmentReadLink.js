export default function GetRouteAttachmentReadLink(clientAPI) {
    try {
        // alert('GetRouteReadLink started');

        const appCD = clientAPI.getAppClientData();
        const binding = clientAPI.getPageProxy().binding;

        // Route can come from app client data or page binding
        const routeUUID = appCD.currentRouteUUID || binding?.RouteUUID;

        if (!routeUUID) {
            // alert('RouteUUID not found');
            return '';
        }

        // alert(`RouteUUID: ${routeUUID}`);

        const routeReadLink = `Routes(guid'${routeUUID}')`;

        // alert(`Route ReadLink: ${routeReadLink}`);

        return routeReadLink;

    } catch (err) {
        // alert('Error in GetRouteReadLink: ' + err.message);
        return '';
    }
}
