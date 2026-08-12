export default async function GetPartyIDs(context) {

    const service = "/LMD_MDKApp/Services/LMD_MA.service";

    const appCD = context.getAppClientData();

    const currentStop =
        appCD.currentStop ||
        context.getPageProxy().binding ||
        context.binding;

    if (!currentStop) {
        return "";
    }

    const routeUUID = currentStop.RouteUUID;
    const stopUUID = currentStop.StopUUID;

    const result = await context.read(
        service,
        "Documents",
        [],
        `$filter=RouteUUID eq guid'${routeUUID}' and StopUUID eq guid'${stopUUID}'&$top=1`
    );

    if (result && result.length > 0) {

        const document = result.getItem(0);

        const shipToPartyID = document.ShipToPartyID || "";
        const soldToPartyID = document.SoldToPartyID || "";

        return `ShipToPartyID : ${shipToPartyID}\nSoldToPartyID : ${soldToPartyID}`;
    }

    return "ShipToPartyID :\nSoldToPartyID :";
}