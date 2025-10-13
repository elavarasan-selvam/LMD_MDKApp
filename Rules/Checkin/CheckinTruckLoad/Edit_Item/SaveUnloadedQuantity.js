/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function SaveUnloadedQuantity(clientAPI){
    const appData = clientAPI.getAppClientData();
    const productID = clientAPI.getPageProxy().binding.ProductID;
    const newUnloadedQty = clientAPI.getControl('UnloadedQuantityInput').getValue();

    // Update UnloadedQuantity in PendingProductList
    const product = appData.PendingProductList.find(p => p.ProductID === productID);
    if (product) {
        product.UnloadedQuantity = newUnloadedQty;
    }
}