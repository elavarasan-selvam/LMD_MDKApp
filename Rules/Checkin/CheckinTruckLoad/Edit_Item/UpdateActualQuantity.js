export default function UpdateActualQuantity(clientAPI) {

    const newValue = Number(clientAPI.getValue()) || 0;
    const page = clientAPI.getPageProxy();
    const binding = page.binding;   // Current PendingProduct item

    // Update only this card's value
    binding.ActualQuantity = newValue;

    // Also update inside PendingProductList array
    const appData = clientAPI.getAppClientData();
    const list = appData.PendingProductList || [];

    const index = list.findIndex(item =>
        item.ProductID === binding.ProductID &&
        item.StopUUID === binding.StopUUID
    );

    if (index !== -1) {
        list[index].ActualQuantity = newValue;
    }

    return true;
}
