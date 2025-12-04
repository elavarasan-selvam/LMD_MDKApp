export default async function Loaded_Value(clientAPI) {
    const binding = clientAPI.getPageProxy().binding;

    if (!binding) {
        return 0;
    }

    const productID = binding.ProductID;
    const orderedQty = Number(binding.OrderedQuantity) || 0;
    const routeUUID = binding.RouteUUID;

    try {
        // 1. Get CHECKOUT Stop for this Route
        const stopResult = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            "$filter=RouteUUID eq guid'" + routeUUID + "' and StopType eq 'CHECKOUT'"
        );

        if (stopResult && stopResult.length > 0) {
            const checkoutStop = stopResult.getItem(0);
            const checkoutStopUUID = checkoutStop.StopUUID;

            // 2. Read COCIProducts using CHECKOUT StopUUID
            const cociResult = await clientAPI.read(
                '/LMD_MDKApp/Services/LMD_MA.service',
                'COCIProducts',
                [],
                "$filter=ProductID eq '" + productID + "' and StopUUID eq guid'" + checkoutStopUUID + "'"
            );

            if (cociResult && cociResult.length > 0) {
                const cociProduct = cociResult.getItem(0);

                if (cociProduct.ActualQuantity !== null && cociProduct.ActualQuantity !== undefined) {
                    return Number(cociProduct.ActualQuantity) + orderedQty;
                }
            }
        }

        return orderedQty;

    } catch (e) {
        return orderedQty;
    }
}
