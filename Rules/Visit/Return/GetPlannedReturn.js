export default async function GetPlannedReturn(context) {
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

    try {
        const documentItems = await context.read(
            "/LMD_MDKApp/Services/LMD_MA.service",
            "DocumentItems",
            [],
            `$filter=StopUUID eq guid'${stopUUID}' and RouteUUID eq guid'${routeUUID}' and IsReturn eq true`
        );

        if (!documentItems || documentItems.length === 0) {
            return "$filter=1 eq 0";
        }

        const documentIDs = documentItems.map(
            item => `'${item.DocumentID}'`
        );

        return `$filter=DocumentID in (${documentIDs.join(",")})`;

    } catch (e) {
        context.getLogger().error("GetPlannedReturn: " + e);
        return "$filter=1 eq 0";
    }
}
