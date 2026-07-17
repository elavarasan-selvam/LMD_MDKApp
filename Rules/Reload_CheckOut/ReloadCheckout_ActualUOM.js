/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function ReloadCheckout_ActualUOM(clientAPI) {
    const appData = clientAPI.getAppClientData();
    const reuom = (appData.Checkout_UOM || "").trim().toUpperCase();
    //alert("ActualUOM sent to backend: " + reuom);
    return reuom;
}
