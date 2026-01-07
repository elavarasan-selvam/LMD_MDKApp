export default function GetItemsCountOfVisit(context) {
    const appCD = context.getAppClientData();
    const stopRef = appCD.currentStop || context.binding;

    if (!stopRef || !stopRef.StopUUID || !context.binding?.RouteUUID) {
        return "Items: 0";
    }

    const stopUUID = stopRef.StopUUID;
    const routeUUID = context.binding.RouteUUID;

    const service = "/LMD_MDKApp/Services/LMD_MA.service";

    const query = `
        $apply=filter(
            RouteUUID eq guid'${routeUUID}'
            and StopUUID eq guid'${stopUUID}'
            and IsReturn eq false
        )/aggregate(ProductID with countdistinct as ProductCount)
    `;

    return context.read(service, "DocumentItems", [], query)
        .then(result => {
            if (result && result.length > 0) {
                return `Items: ${result.getItem(0).ProductCount || 0}`;
            }
            return "Items: 0";
        })
        .catch(() => "Items: 0");
}
