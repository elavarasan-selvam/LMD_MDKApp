export default async function GetPlannedMobileSales(context) {

    const appCD = context.getAppClientData();

    const stopRef =
        appCD.currentStop ||
        context.getPageProxy().binding ||
        context.binding;

    const routeRef =
        context.binding ||
        context.getPageProxy().binding;

    if (!stopRef?.StopUUID || !routeRef?.RouteUUID) {
        return "$filter=1 eq 0";
    }

    const stopUUID = stopRef.StopUUID;
    const routeUUID = routeRef.RouteUUID;

    return `$filter=StopUUID eq guid'${stopUUID}' and RouteUUID eq guid'${routeUUID}'`;
}