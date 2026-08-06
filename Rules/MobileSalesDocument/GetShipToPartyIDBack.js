/**
 * @param {IClientAPI} context
 */
export default async function GetShipToPartyIDBack(context) {

    const service = "/LMD_MDKApp/Services/LMD_MA.service";

    const appCD = context.getAppClientData();

    const currentStop =
        appCD.currentStop ||
        context.getPageProxy().binding ||
        context.binding;

    const routeUUID = currentStop.RouteUUID;
    const stopUUID = currentStop.StopUUID;

    const result = await context.read(
        service,
        "Documents",
        [],
        `$filter=RouteUUID eq guid'${routeUUID}' and StopUUID eq guid'${stopUUID}'&$top=1`
    );

    if (result && result.length > 0) {
        alert(`ShipToPartyID: ${result.getItem(0).ShipToPartyID}`);
        return result.getItem(0).ShipToPartyID;
    }

    return "";
}