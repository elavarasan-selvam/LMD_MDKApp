/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function ReloadCheckout_ProductID(clientAPI) {
    const appData = clientAPI.getAppClientData();
    return appData.Checkout_ProductID || "";
    //return appData.ProductID || "";
}
