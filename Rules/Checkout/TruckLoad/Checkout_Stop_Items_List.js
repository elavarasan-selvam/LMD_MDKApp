export default async function Checkout_Stop_Items_List(context) {
    const binding = context.binding;

    if (!binding || !binding.RouteUUID) {
        alert("No RouteUUID found in binding");
        return [];
    }

    const routeUUID = binding.RouteUUID;
    alert("Using RouteUUID: " + routeUUID);

    const filter = "$filter=IsReturn eq false and RouteUUID eq guid'" + routeUUID + "'";
    alert("Applied Filter: " + filter);

    const result = await context.read(
        "/LMD_MDKApp/Services/LMD_MA.service",
        "DocumentItems",
        [],
        filter
    );

    alert("Total records fetched: " + result.length);

    const map = {};

    result.forEach(item => {
        const productId = item.ProductID || "";
        const uom = item.OrderedUOM || "";
        const key = productId + "::" + uom;
        const qty = Number(item.OrderedQuantity) || 0;
        const docId = item.DocumentID;
        const docItemId = item.DocumentItemID;

        if (!map[key]) {
            map[key] = {
                ProductID: productId,
                OrderedQuantity: qty,
                OrderedUOM: uom,
                DocumentIDs: docId ? [docId] : [],
                DocumentItemIDs: docItemId ? [docItemId] : [],
                RouteUUID: routeUUID 
            };
        } else {
            map[key].OrderedQuantity += qty;

            if (docId && !map[key].DocumentIDs.includes(docId)) {
                map[key].DocumentIDs.push(docId);
            }

            if (docItemId && !map[key].DocumentItemIDs.includes(docItemId)) {
                map[key].DocumentItemIDs.push(docItemId);
            }
        }
    });

    const finalList = Object.values(map);
    alert("Final aggregated product count: " + finalList.length);

    // Store aggregated list in clientData for Edit Item page
    context.getPageProxy().getClientData().AggregatedList = finalList;
    alert("Aggregated list stored in AppClientData: " + JSON.stringify(finalList));
    return finalList;
}
