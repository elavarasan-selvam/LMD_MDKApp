export default function SetOrderedFlag(clientAPI) {

    const page = clientAPI.getPageProxy();
    const binding = page.binding;
    const appData = clientAPI.getAppClientData();

    // New user-entered quantity (numeric safe)
    const newQty = Number(clientAPI.getValue()) || 0;

    // 1) Store ORIGINAL OrderedQuantity only once
    if (binding._OriginalOrderedQuantity === undefined || binding._OriginalOrderedQuantity === null) {
        binding._OriginalOrderedQuantity = Number(binding.OrderedQuantity) || 0;
    }

    const oldQty = Number(binding._OriginalOrderedQuantity) || 0;

    // 2) Set Change Flag (1 if changed, 0 if unchanged)
    binding._OrderedChanged = (oldQty !== newQty) ? 1 : 0;

    // 3) Always store LATEST values in AppClientData
    appData.Checkout_ProductID = binding.ProductID;
    appData.Checkout_UOM = binding.OrderedUOM;
    appData.Checkout_Quantity = newQty;              
    appData.Checkout_StopUUID = binding.StopUUID;

    // 4) Debug (you can remove once verified)
    alert(
        "Ordered Quantity Change Detected:\n" +
        "Old = " + oldQty + "\n" +
        "New = " + newQty + "\n" +
        "Flag = " + binding._OrderedChanged + "\n\n" +
        "Checkout Data Stored:\n" +
        "ProductID = " + appData.Checkout_ProductID + "\n" +
        "UOM = " + appData.Checkout_UOM + "\n" +
        "Qty = " + appData.Checkout_Quantity + "\n" +
        "StopUUID = " + appData.Checkout_StopUUID
    );

    return true;
}
