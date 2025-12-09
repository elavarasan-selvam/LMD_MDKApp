export default async function Actual_Quantity_Checkin(clientAPI) {
    const binding = clientAPI.getPageProxy().binding;

    if (!binding) {
        //alert("No binding found");
        return 0;
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
            const checkinStopUUID = checkinStops.getItem ? checkinStops.getItem(0).StopUUID : checkinStops[0].StopUUID;

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

                //alert("COCIProduct ActualQuantity: " + coci.ActualQuantity);

                if (coci.ActualQuantity !== null && coci.ActualQuantity !== undefined) {
                    //alert("Returning COCIProduct ActualQuantity: " + coci.ActualQuantity);
                    return Number(coci.ActualQuantity);
                }
            }
        }

        // 3. Fallback to binding value
        const fallbackValue = Number(binding.ActualQuantity) || 0;
        //alert("No COCIProduct found. Returning binding ActualQuantity: " + fallbackValue);
        return fallbackValue;

    } catch (e) {
        const fallbackValue = Number(binding.ActualQuantity) || 0;
        alert("Error reading COCIProducts: " + e.message + "\nReturning binding ActualQuantity: " + fallbackValue);
        return fallbackValue;
    }
}
