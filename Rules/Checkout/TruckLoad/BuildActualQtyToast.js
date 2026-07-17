/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function BuildActualQtyToast(clientAPI) 
{

    const appData = clientAPI.getAppClientData();

    const reqty = appData.Checkout_Quantity || 0;
//    alert(`BuildActualQtyToast → Actual quantity updated to ${reqty}`);
    return `Actual quantity updated to ${reqty}`;
}
