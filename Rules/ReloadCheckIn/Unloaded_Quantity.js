export default async function Unloaded_Quantity(clientAPI) {
    const binding = clientAPI.getPageProxy().binding;

    if (!binding) {
        return 0;
    }

    const routeUUID = binding.RouteUUID;
    const productID = binding.ProductID;

    try {
        // 1. Read RELOAD_CI stop for this route
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

            // 2. Read COCIProducts for this Stop and Product
            const cociProducts = await clientAPI.read(
                '/LMD_MDKApp/Services/LMD_MA.service',
                'COCIProducts',
                [],
                `$filter=StopUUID eq guid'${reloadStopUUID}' and ProductID eq '${productID}'`
            );

            if (cociProducts && cociProducts.length > 0) {
                const coci = cociProducts.getItem ? cociProducts.getItem(0) : cociProducts[0];

                if (coci.UnloadedQuantity !== null && coci.UnloadedQuantity !== undefined) {
                    return Number(coci.UnloadedQuantity);
                }
            }
        }

        // Fallback
        return binding.UnloadedQuantity || 0;

    } catch (e) {
        return binding.UnloadedQuantity || 0;
    }
}