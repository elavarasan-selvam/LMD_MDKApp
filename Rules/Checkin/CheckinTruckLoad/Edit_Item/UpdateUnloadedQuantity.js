import GetActualQty from './Actual_Quantity_Checkin'; 

export default async function UpdateUnloadedQuantity(clientAPI) { 
    const newValue = Number(clientAPI.getValue()) || 0; 
    const page = clientAPI.getPageProxy(); const binding = page.binding; 
    const actualQty = await GetActualQty(clientAPI); 
    if (newValue > actualQty) {
         await clientAPI.executeAction('/LMD_MDKApp/Actions/StartCheckin/UnloadedQuantityValidationMessage.action'); 
         
         clientAPI.setValue(actualQty); return false;
    } 
    binding.UnloadedQuantity = newValue; 
    const appData = clientAPI.getAppClientData(); 
    const list = appData.PendingProductList || []; 
    const index = list.findIndex(item => item.ProductID === binding.ProductID && item.StopUUID === binding.StopUUID ); 
    if (index !== -1) { 
        list[index].UnloadedQuantity = newValue; 
    } 
    return true; 

}