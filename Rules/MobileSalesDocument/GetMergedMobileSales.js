

export default async function GetMergedMobileSales(context) {

    const appCD = context.getAppClientData();

    // =========================================================
    // PRODUCT DESCRIPTION CACHE
    // =========================================================
    if (!appCD.MobileSalesDescriptions) {
        appCD.MobileSalesDescriptions = {};
    }

    // =========================================================
    // GET STOP REFERENCE
    // =========================================================
    const stopRef =
        appCD.currentStop ||
        context.getPageProxy().binding ||
        context.binding;

    // =========================================================
    // GET ROUTE REFERENCE
    // =========================================================
    const routeRef =
        context.binding ||
        context.getPageProxy().binding;

    // =========================================================
    // VALIDATE STOP + ROUTE
    // =========================================================
    if (!stopRef?.StopUUID || !routeRef?.RouteUUID) {
        return [];
    }

    const stopUUID = stopRef.StopUUID;
    const routeUUID = routeRef.RouteUUID;

    // =========================================================
    // READ MOBILE SALES DOCUMENT ITEMS
    // =========================================================
    const result = await context.read(
        "/LMD_MDKApp/Services/LMD_MA.service",
        "MobileSalesDocumentItems",
        [],
        `$filter=StopUUID eq guid'${stopUUID}' and RouteUUID eq guid'${routeUUID}'`
    );

    // =========================================================
    // MAP FOR MERGING SAME PRODUCTS
    //
    // Example:
    // CHOCOS123 -> 10
    // CHOCOS123 -> 20
    //
    // Result:
    // CHOCOS123 -> 30
    // =========================================================
    const mergedProducts = new Map();

    // =========================================================
    // LOOP THROUGH ITEMS
    // =========================================================
    for (let i = 0; i < result.length; i++) {

        const item = result.getItem(i);

        if (!item || !item.ProductID) {
            continue;
        }

        const productID = String(item.ProductID).trim();

        // -----------------------------------------------------
        // GET QUANTITY SAFELY
        // -----------------------------------------------------
        const quantity = Number(item.OrderedQuantity) || 0;

        // -----------------------------------------------------
        // GET UOM
        // -----------------------------------------------------
        const orderedUOM = item.OrderedUOM || "";

        // -----------------------------------------------------
        // GET PRODUCT DESCRIPTION FROM CACHE
        // -----------------------------------------------------
        let productDesc =
            appCD.MobileSalesDescriptions[productID];

        // -----------------------------------------------------
        // FETCH DESCRIPTION IF NOT AVAILABLE IN CACHE
        // -----------------------------------------------------
        if (!productDesc) {

            const descResult = await context.read(
                "/LMD_MDKApp/Services/API_PRODUCT_SRV.service",
                "A_ProductDescription",
                [],
                `$filter=Product eq '${productID}' and Language eq 'EN'`
            );

            if (descResult.length > 0) {

                productDesc =
                    descResult.getItem(0).ProductDescription;

                // Store in cache
                appCD.MobileSalesDescriptions[productID] =
                    productDesc;
            }
        }

        // =====================================================
        // CHECK WHETHER PRODUCT ALREADY EXISTS
        // =====================================================
        if (mergedProducts.has(productID)) {

            const existingProduct =
                mergedProducts.get(productID);

            // -------------------------------------------------
            // ADD QUANTITY
            // -------------------------------------------------
            existingProduct.OrderedQuantity += quantity;

        } else {

            // =================================================
            // FIRST OCCURRENCE OF PRODUCT
            // =================================================
            mergedProducts.set(productID, {
                ProductID: productID,
                OrderedQuantity: quantity,
                OrderedUOM: orderedUOM,
                ProductDesc: productDesc || ""
            });
        }
    }

    // =========================================================
    // CONVERT MAP TO ARRAY
    // =========================================================
    return Array.from(mergedProducts.values());
}