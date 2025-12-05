export default async function GetPlannedReturn(context) {
    const appCD = context.getAppClientData();
    const stopRef = appCD.currentStop || context.binding;

    if (!stopRef || !stopRef.StopUUID || !context.binding?.RouteUUID) {
        alert("Stop or Route information missing");
        return "$filter=1 eq 0";
    }

    const stopUUID = stopRef.StopUUID;
    const routeUUID = context.binding.RouteUUID;

    alert("Using StopUUID: " + stopUUID + ", RouteUUID: " + routeUUID);

    try {
        const documentItems = await context.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'DocumentItems',
            [],
            `$filter=StopUUID eq guid'${stopUUID}' and RouteUUID eq guid'${routeUUID}' and IsReturn eq true`
        );

        if (!documentItems || documentItems.length === 0) {
            alert("No DocumentItems found for this StopUUID");
            return "$filter=1 eq 0";
        }

        const documentIDs = documentItems.map(item => `'${item.DocumentID}'`);
        const filter = `$filter=DocumentID in (${documentIDs.join(",")})`;

        alert("PlannedDelivery Filter: " + filter);

        return filter;

    } catch (e) {
        alert("Error reading DocumentItems: " + e);
        return "$filter=1 eq 0";
    }
}
