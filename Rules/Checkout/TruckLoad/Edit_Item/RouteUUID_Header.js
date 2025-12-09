export default function RouteUUID_Header(clientAPI) {
    const appData = clientAPI.getAppClientData();
    const routeUUID = appData.Edit_RouteUUID || "";

    if (!routeUUID) {
        //alert("RouteUUID is missing for OfflineOData.TransactionID header");
    } else {
        //alert("RouteUUID used in header: " + routeUUID);
    }

    return routeUUID;
}