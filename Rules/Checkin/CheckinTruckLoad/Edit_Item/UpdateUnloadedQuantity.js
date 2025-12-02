export default function UpdateUnloadedQuantity(clientAPI) {

    const newValue = Number(clientAPI.getValue()) || 0;
    const page = clientAPI.getPageProxy();
    const binding = page.binding;   // This is your current PendingProduct item

    // Update only this card's value
    binding.UnloadedQuantity = newValue;

    // Also update inside PendingProductList array
    const appData = clientAPI.getAppClientData();
    const list = appData.PendingProductList || [];

    const index = list.findIndex(item =>
        item.ProductID === binding.ProductID &&
        item.StopUUID === binding.StopUUID
    );

    if (index !== -1) {
        list[index].UnloadedQuantity = newValue;
    }

    return true;
}
