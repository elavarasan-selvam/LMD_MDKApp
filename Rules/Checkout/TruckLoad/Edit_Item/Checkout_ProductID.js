/**
 * Return ProductID for Checkout COCIProduct
 * @param {IClientAPI} clientAPI
 */
export default function Checkout_ProductID(clientAPI) {
    const appData = clientAPI.getAppClientData();
    return appData.Checkout_ProductID || "";
}
