/**
 * Return ActualUOM for Checkout COCIProduct
 * @param {IClientAPI} clientAPI
 */
export default function Checkout_ActualUOM(clientAPI) {
    const appData = clientAPI.getAppClientData();
    return appData.Checkout_UOM || "";
}
