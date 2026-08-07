/**
 * @param {IClientAPI} clientAPI
 */
export default function ReloadSetReasonFlag(clientAPI) {
    const binding = clientAPI.getPageProxy().binding;
    const appData = clientAPI.getAppClientData();
    const newQty = Number(clientAPI.getValue()) || 0;
    //alert("ReloadSetReasonFlag: newQty = " + newQty);
    //const oldQty = Number(appData.Reload_OrderedQty || 0); // summed quantity
    const oldQty = Number(appData.Edit_OrderedQty || 0);
    //binding._OrderedChanged = (oldQty !== newQty) ? 1 : 0;
    //binding._LoadedChanged =oldQty !== newQty ? 1 : 0;
    binding._LoadedChanged =(oldQty !== newQty) ? 1 : 0;
    appData.Checkout_Quantity = newQty;
    //alert("Old (sum) = " + oldQty + "\n" +"New = " + newQty + "\n" +"Actual quantity to send = " + (newQty - oldQty) );

    return true;
}