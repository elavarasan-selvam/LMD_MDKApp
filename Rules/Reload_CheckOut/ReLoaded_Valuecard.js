/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default async function ReLoaded_Valuecard(clientAPI) {
    const binding = clientAPI.getPageProxy().binding;

    if (!binding) {
        return '0';
    }

    const reproductID = binding.ProductID;
    const reorderedQty = Number(binding.OrderedQuantity) || 0;
    const rerouteUUID = binding.RouteUUID;

    try {
        // 1. Read CHECKOUT Stop for this Route
        const stopResult = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            "$filter=RouteUUID eq guid'" + rerouteUUID + "' and StopType eq 'RELOAD_CO'"
        );

        if (stopResult && stopResult.length > 0) {
            const recheckoutStop = stopResult.getItem ? stopResult.getItem(0) : stopResult[0];
            const recheckoutStopUUID = recheckoutStop.StopUUID;

            // 2. Read COCIProducts using CHECKOUT StopUUID
            const recociResult = await clientAPI.read(
                '/LMD_MDKApp/Services/LMD_MA.service',
                'COCIProducts',
                [],
                "$filter=ProductID eq '" + reproductID + "' and StopUUID eq guid'" + recheckoutStopUUID + "'"
            );

            if (recociResult && recociResult.length > 0) {
                const recociProduct = recociResult.getItem ? recociResult.getItem(0) : recociResult[0];

                if (recociProduct.ActualQuantity !== null && recociProduct.ActualQuantity !== undefined) {
                    return String(Number(recociProduct.ActualQuantity) + reorderedQty);
                }
            }
        }

        return String(reorderedQty);

    } catch (e) {
        return String(reorderedQty);
    }
}

