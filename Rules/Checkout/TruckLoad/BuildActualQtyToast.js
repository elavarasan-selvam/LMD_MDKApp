/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function BuildActualQtyToast(clientAPI) 
{

    const appData = clientAPI.getAppClientData();

    const qty = appData.Checkout_Quantity || 0;

    return `Actual quantity updated to ${qty}`;
}
