export default async function Checkout_Stop_Items_List(context) {

    try {

        const binding = context.binding;

        if (!binding || !binding.RouteUUID) {
            return [];
        }

        const routeUUID = binding.RouteUUID;

        //====================================================
        // FETCH RELOAD REQUESTS FOR ROUTE
        //====================================================
        const reloadRequests = await context.read(
            "/LMD_MDKApp/Services/API_LASTMILERELOADREQUEST.service",
            "ReloadRequest",
            [],
            `$filter=LastMileRouteUUID eq ${routeUUID}`
        );

        const reloadUUIDs = [];

        if (reloadRequests && reloadRequests.length > 0) {

            reloadRequests.forEach(item => {
                if (item.LastMileReloadRequestUUID) {
                    reloadUUIDs.push(item.LastMileReloadRequestUUID);
                }
            });
        }

        //====================================================
        // FETCH RELOAD REQUEST DELIVERY DOCUMENTS
        //====================================================
        const reloadDeliveryDocuments = [];

        if (reloadUUIDs.length > 0) {

            for (let i = 0; i < reloadUUIDs.length; i++) {

                const reloadDeliveries = await context.read(
                    "/LMD_MDKApp/Services/API_LASTMILERELOADREQUEST.service",
                    "ReloadRequestDelivery",
                    [],
                    `$filter=LastMileReloadRequestUUID eq ${reloadUUIDs[i]}`
                );

                if (reloadDeliveries && reloadDeliveries.length > 0) {

                    reloadDeliveries.forEach(item => {

                        if (item.DeliveryDocument) {
                            reloadDeliveryDocuments.push(item.DeliveryDocument);
                        }
                    });
                }
            }
        }

        const uniqueReloadDeliveryDocs = [...new Set(reloadDeliveryDocuments)];

        //====================================================
        // FETCH CHECKOUT DOCUMENT ITEMS
        //====================================================
        const documentItems = await context.read(
            "/LMD_MDKApp/Services/LMD_MA.service",
            "DocumentItems",
            [],
            `$filter=IsReturn eq false and RouteUUID eq guid'${routeUUID}'`
        );

        //====================================================
        // FILTER ITEMS NOT PRESENT IN RELOAD REQUEST
        //====================================================
        const checkoutOnlyItems = [];

        if (documentItems && documentItems.length > 0) {

            documentItems.forEach(item => {

                // Keep only items whose DocumentID is NOT in ReloadRequestDelivery
                if (!uniqueReloadDeliveryDocs.includes(item.DocumentID)) {
                    checkoutOnlyItems.push(item);
                }
            });
        }

        //====================================================
        // AGGREGATION
        //====================================================
        const map = {};

        checkoutOnlyItems.forEach(item => {

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

        // Store aggregated list in clientData for Edit Item page
        context.getPageProxy().getClientData().AggregatedList = finalList;

        return finalList;

    } catch (e) {

        //alert("ERROR OCCURRED: " + e);

        if (e.message) {
            //alert("MESSAGE = " + e.message);
        }

        if (e.stack) {
            //alert("STACK = " + e.stack);
        }

        return [];
    }
}