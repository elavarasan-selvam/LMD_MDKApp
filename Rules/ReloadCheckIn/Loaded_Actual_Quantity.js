export default async function Loaded_Actual_Quantity(clientAPI) {
    const binding = clientAPI.getPageProxy().binding;

    if (!binding) {
        //alert("No binding found");
        return "";
    }

    const routeUUID = binding.RouteUUID;
    const productID = binding.ProductID;

    try {
        // 1. Read Reload stop for this route
        const reloadStops = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'RELOAD_CI'`
        );

        if (reloadStops && reloadStops.length > 0) {
            const reloadStopUUID = reloadStops.getItem
                ? reloadStops.getItem(0).StopUUID
                : reloadStops[0].StopUUID;

            //alert("RELOAD StopUUID: " + reloadStopUUID);

            // 2. Read COCIProducts for this Stop and Product
            const cociProducts = await clientAPI.read(
                '/LMD_MDKApp/Services/LMD_MA.service',
                'COCIProducts',
                [],
                `$filter=StopUUID eq guid'${reloadStopUUID}' and ProductID eq '${productID}'`
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
