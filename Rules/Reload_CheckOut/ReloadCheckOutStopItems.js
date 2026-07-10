export default async function Checkout_Stop_Items_List(context) {
 
    try {
 
        const binding = context.binding;
    
 
        if (!binding) {
            
            return [];
        }
  
        if (!binding.RouteUUID) {
            
            return [];
        }
        const routeUUID = binding.RouteUUID;
      
        //====================================================
        // ReloadRequest
        //====================================================
 
      
        const filter = `$filter=LastMileRouteUUID eq ${routeUUID}`;
 
 
 
        const reloadRequests = await context.read(
        "/LMD_MDKApp/Services/API_LASTMILERELOADREQUEST.service",
        "ReloadRequest",
        [],
        filter
       );
        
       
 
  
 
        
 
        const reloadUUIDs = [];
 
        reloadRequests.forEach(item => {
            reloadUUIDs.push(item.LastMileReloadRequestUUID);
        });
 
       
//        alert("ReloadUUIDs  :" + JSON.stringify(reloadUUIDs));
 
        //====================================================
        // ReloadRequestDelivery
        //====================================================
 
        const deliveryDocuments = [];
 
        for (let i = 0; i < reloadUUIDs.length; i++) {
 
        
 
            const deliveries = await context.read(
                "/LMD_MDKApp/Services/API_LASTMILERELOADREQUEST.service",
                "ReloadRequestDelivery",
                [],
                `$filter=LastMileReloadRequestUUID eq ${reloadUUIDs[i]}`
            );
 
            
 
           
 
            deliveries.forEach(item => {
 
                deliveryDocuments.push(item.DeliveryDocument);
 
            });
 
        }
 
        
 
//        alert(JSON.stringify(deliveryDocuments));
 
        const uniqueDeliveryDocs = [...new Set(deliveryDocuments)];
 
//        alert("12. Unique Delivery Docs");
 
//        alert(JSON.stringify(uniqueDeliveryDocs));
 
        //====================================================
        // DocumentItems
        //====================================================
 
       
 
        const documentItems = await context.read(
            "/LMD_MDKApp/Services/LMD_MA.service",
            "DocumentItems",
            [],
            `$filter=IsReturn eq false and RouteUUID eq ${routeUUID}`
        );
 
       
 
     
 
        const matchedItems = [];
 
        documentItems.forEach(item => {
 
//            alert("Checking DocumentID = " + item.DocumentID);
 
            if (uniqueDeliveryDocs.includes(item.DocumentID)) {
 
//                alert("Matched = " + item.DocumentID);
 
                matchedItems.push(item);
 
            }
 
        });
 
        
 
        //====================================================
        // Aggregation
        //====================================================
 
        const map = {};
 
        matchedItems.forEach(item => {
 
            const key = item.ProductID + "::" + item.OrderedUOM;
 
            if (!map[key]) {
 
                map[key] = {
                    ProductID: item.ProductID,
                    OrderedQuantity: Number(item.OrderedQuantity),
                    OrderedUOM: item.OrderedUOM,
                    DocumentIDs: [item.DocumentID],
                    DocumentItemIDs: [item.DocumentItemID],
                    RouteUUID: routeUUID
                };
 
            } else {
 
                map[key].OrderedQuantity += Number(item.OrderedQuantity);
 
                if (!map[key].DocumentIDs.includes(item.DocumentID)) {
                    map[key].DocumentIDs.push(item.DocumentID);
                }
 
                if (!map[key].DocumentItemIDs.includes(item.DocumentItemID)) {
                    map[key].DocumentItemIDs.push(item.DocumentItemID);
                }
 
            }
 
        });
 
       
 
        const ReloadfinalList = Object.values(map);
 
//        alert("17. Final List Count = " + ReloadfinalList.length);
 
        context.getPageProxy().getClientData().AggregatedList = ReloadfinalList;
 
        
 
        return ReloadfinalList;
 
    } catch (e) {
 
//        alert("ERROR OCCURRED");
 
//        alert(e);
 
        if (e.message) {
//            alert("MESSAGE = " + e.message);
        }
 
        if (e.stack) {
//            alert("STACK = " + e.stack);
        }
 
        return [];
    }
 
}