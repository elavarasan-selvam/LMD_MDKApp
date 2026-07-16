export default function UpdateUnloadedQuantity(clientAPI) {
    const pageProxy = clientAPI.getPageProxy();

    const unloadedControl = pageProxy.evaluateTargetPath(
        "#Page:ReloadCheckout_EditItem/#Control:SectionedTable0/#Control:UnloadedQuantityInput"
    );

    // Get the latest value
    const newValue = Number(unloadedControl.getValue()) || 0;
    const binding = pageProxy.binding;

    // Update the binding immediately
    binding.UnloadedQuantity = newValue;

    // Update app client data list
    const appData = clientAPI.getAppClientData();
    const list = appData.ReloadPendingProductList || [];
    const index = list.findIndex(
        item => item.ProductID === binding.ProductID && item.StopUUID === binding.StopUUID
    );
    if (index !== -1) {
        list[index].UnloadedQuantity = newValue;
    }

    // Debug alert to check value is captured
    //alert("DEBUG: Updated UnloadedQuantity = " + newValue);

    return true;
}
