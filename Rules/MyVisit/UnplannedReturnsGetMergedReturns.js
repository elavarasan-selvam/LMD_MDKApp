/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default async function GetMergedReturns(context) {
 
    const appCD = context.getAppClientData();
 
    const stopRef =
        appCD.currentStop ||
        context.getPageProxy().binding ||
        context.binding;
 
    const routeRef =
        context.binding ||
        context.getPageProxy().binding;
 
    if (!stopRef?.StopUUID || !routeRef?.RouteUUID) {
        return [];
    }
 
    const stopUUID = stopRef.StopUUID;
    const routeUUID = routeRef.RouteUUID;
 
    const items = await context.read(
        "/LMD_MDKApp/Services/LMD_MA.service",
        "DocumentItems",
        [],
        `$filter=StopUUID eq guid'${stopUUID}' and RouteUUID eq guid'${routeUUID}' and IsReturn eq true`
    );
 
    const productMap = {};
 
    for (let i = 0; i < items.length; i++) {
 
        const item = items.getItem(i);
 
        const key = item.ProductID + "::" + item.OrderedUOM;
 
        if (!productMap[key]) {
 
            productMap[key] = {
                ProductID: item.ProductID,
                OrderedUOM: item.OrderedUOM,
                DeliveredQuantity: Number(item.DeliveredQuantity || 0),
                ProductDesc: item.ProductDesc,
                ItemData: item
            };
 
        } else {
 
            productMap[key].DeliveredQuantity += Number(item.DeliveredQuantity || 0);
        }
    }
 
    return Object.values(productMap);
}
