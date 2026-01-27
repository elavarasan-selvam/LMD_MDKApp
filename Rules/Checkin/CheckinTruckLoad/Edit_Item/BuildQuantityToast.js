export default function BuildQuantityToast(clientAPI) {

    const binding = clientAPI.getPageProxy().binding;

    const productId = binding.ProductID || "";

    const actual = binding.ActualQuantity ?? 0;
    const unloaded = binding.UnloadedQuantity ?? 0;

    if (productId) {
        return `${productId}: Actual ${actual}, Unloaded ${unloaded} updated`;
    }

    return `Actual ${actual}, Unloaded ${unloaded} updated`;
}
