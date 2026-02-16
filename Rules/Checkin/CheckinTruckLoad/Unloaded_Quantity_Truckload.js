/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default async function Unloaded_Quantity_Truckload(clientAPI) {

    const binding = clientAPI.getPageProxy().binding;

    if (!binding) {
        return 'Unloaded : 0';
    }

    const routeUUID = binding.RouteUUID;
    const productID = binding.ProductID;

    try {

        // 1. Read CHECKIN stop
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

            // 2. Read COCIProducts
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

                if (coci.UnloadedQuantity !== null && coci.UnloadedQuantity !== undefined) {

                    return `Unloaded : ${Number(coci.UnloadedQuantity)}`;
                }
            }
        }

        // Fallback
        return `Unloaded : ${binding.UnloadedQuantity || 0}`;

    } catch (e) {

        return `Unloaded : ${binding.UnloadedQuantity || 0}`;
    }
}
