export default async function Unloaded_Quantity(clientAPI) {
    const binding = clientAPI.getPageProxy().binding;

    if (!binding) {
        //alert("No binding found");
        return null;
    }

    const routeUUID = binding.RouteUUID;
    const productID = binding.ProductID;

    try {
        // 1. Read CHECKIN stop for this route
        const checkinStops = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKIN'`
        );

        if (checkinStops && checkinStops.length > 0) {
            const checkinStopUUID = checkinStops.getItem
                ? checkinStops.getItem(0).StopUUID
                : checkinStops[0].StopUUID;

            //alert("CHECKIN StopUUID: " + checkinStopUUID);

            // 2. Read COCIProducts for this Stop and Product
            const cociProducts = await clientAPI.read(
                '/LMD_MDKApp/Services/LMD_MA.service',
                'COCIProducts',
                [],
                `$filter=StopUUID eq guid'${checkinStopUUID}' and ProductID eq '${productID}'`
            );

            if (cociProducts && cociProducts.length > 0) {
                const coci = cociProducts.getItem ? cociProducts.getItem(0) : cociProducts[0];

                //alert("COCIProduct UnloadedQuantity: " + coci.UnloadedQuantity);

                if (coci.UnloadedQuantity !== null && coci.UnloadedQuantity !== undefined) {
                    //alert("Returning COCIProduct UnloadedQuantity: " + coci.UnloadedQuantity);
                    return Number(coci.UnloadedQuantity);
                }
            }
        }

        // If nothing found in read → return NULL
        //alert("Returning binding UnloadedQuantity: " + binding.UnloadedQuantity);
        return binding.UnloadedQuantity;

    } catch (e) {
        alert("Error reading COCIProducts: " + e.message);
        //alert("Returning binding UnloadedQuantity: " + binding.UnloadedQuantity);
        return binding.UnloadedQuantity;
    }
}
