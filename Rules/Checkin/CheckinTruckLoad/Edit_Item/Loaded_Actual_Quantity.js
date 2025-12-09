export default async function Loaded_Actual_Quantity(clientAPI) {
    const binding = clientAPI.getPageProxy().binding;

    if (!binding) {
        //alert("No binding found");
        return "";
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
                const coci = cociProducts.getItem
                    ? cociProducts.getItem(0)
                    : cociProducts[0];

                //alert("COCIProduct Values\n" +"ActualQuantity: " + coci.ActualQuantity + "\n" +"ActualUOM: " + coci.ActualUOM);

                if (coci.ActualQuantity !== null && coci.ActualQuantity !== undefined) {
                    const result =
                        Number(coci.ActualQuantity) + " " + (coci.ActualUOM || "");
                    //alert("Returning from COCIProducts: " + result);
                    return result;
                }
            }
        }

        // 3. Fallback to binding values
        const fallbackQty = Number(binding.ActualQuantity) || 0;
        const fallbackUOM = binding.ActualUOM || "";
        const fallbackResult = fallbackQty + " " + fallbackUOM;

        //alert("No COCIProduct found. Returning binding values: " + fallbackResult);
        return fallbackResult;

    } catch (e) {
        const fallbackQty = Number(binding.ActualQuantity) || 0;
        const fallbackUOM = binding.ActualUOM || "";
        const fallbackResult = fallbackQty + " " + fallbackUOM;

        //alert("Error reading COCIProducts: " + e.message +"\nReturning binding values: " + fallbackResult);
        return fallbackResult;
    }
}
