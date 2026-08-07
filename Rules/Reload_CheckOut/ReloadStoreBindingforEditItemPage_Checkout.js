/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function ReloadStoreBindingforEditItemPage_Checkout(clientAPI) {

    const binding = clientAPI.binding;
    const appData = clientAPI.getAppClientData();

    appData.Checkout_ProductID = binding.ProductID;
    appData.Checkout_UOM = binding.OrderedUOM;
    appData.Edit_OrderedQty = Number(binding.OrderedQuantity);

   /** alert(
        "Tapped product on Edit Item page\n" +
        "ProductID = " + appData.Checkout_ProductID +
        "\nUOM = " + appData.Checkout_UOM +
        "\nOrderedQuantity = " + appData.Edit_OrderedQty
    );*/

    return true;
}
