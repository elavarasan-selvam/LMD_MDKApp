export default function StoreBindingforEditItemPage_Checkout(clientAPI) {
    const binding = clientAPI.getPageProxy().binding;
    const appData = clientAPI.getAppClientData();

    // Store product info
    appData.Checkout_ProductID  = binding.ProductID;
    appData.Checkout_UOM        = binding.OrderedUOM;
    appData.Edit_OrderedQty     = binding.OrderedQuantity; // sum already

    alert(
        "Tapped product on Edit Item page:\n" +
        "ProductID = " + appData.Checkout_ProductID + "\n" +
        "UOM = " + appData.Checkout_UOM + "\n" +
        "OrderedQuantity (sum) = " + appData.Edit_OrderedQty
    );

    return true;
}
