export default async function GetMergedMobileSales(context) {

    const appCD = context.getAppClientData();

    if (!appCD.MobileSalesDescriptions) {
        appCD.MobileSalesDescriptions = {};
    }

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

    const result = await context.read(
        "/LMD_MDKApp/Services/LMD_MA.service",
        "MobileSalesDocumentItems",
        [],
        `$filter=StopUUID eq guid'${stopUUID}' and RouteUUID eq guid'${routeUUID}'`
    );

    const items = [];

    for (let i = 0; i < result.length; i++) {

        const item = result.getItem(i);

        let productDesc = appCD.MobileSalesDescriptions[item.ProductID];

        if (!productDesc) {

            const descResult = await context.read(
                "/LMD_MDKApp/Services/API_PRODUCT_SRV.service",
                "A_ProductDescription",
                [],
                `$filter=Product eq '${item.ProductID}' and Language eq 'EN'`
            );

            if (descResult.length > 0) {

                productDesc = descResult.getItem(0).ProductDescription;

                appCD.MobileSalesDescriptions[item.ProductID] = productDesc;
            }
        }

        items.push({
            ProductID: item.ProductID,
            OrderedQuantity: item.OrderedQuantity,
            OrderedUOM: item.OrderedUOM,
            ProductDesc: productDesc || ""
        });
    }

    return items;
}