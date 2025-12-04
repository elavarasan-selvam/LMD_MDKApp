export default async function Checkout_ActualQuantity(clientAPI) {

    const appData = clientAPI.getAppClientData();

    const checkoutQty = Number(appData.Checkout_Quantity || 0);
    const productID   = appData.Checkout_ProductID;
    const stopUUID    = appData.Checkout_StopUUID;

    alert(
        "Inputs from AppClientData:\n" +
        "Checkout Qty = " + checkoutQty + "\n" +
        "ProductID = " + productID + "\n" +
        "StopUUID = " + stopUUID
    );

    const result = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'DocumentItems',
        [],
        `$filter=StopUUID eq guid'${stopUUID}' and ProductID eq '${productID}'`
    );

    if (!result || result.length === 0) {
        alert("No DocumentItem found for this Stop & Product");
        return 0;
    }

    const item = result.getItem(0);
    const orderedQty = Number(item.OrderedQuantity || 0);

    alert("Ordered Quantity from DocumentItems = " + orderedQty);

    const actualQty = checkoutQty - orderedQty;

    alert("Final ACTUAL Quantity Sent to Backend = " + actualQty);

    return actualQty;
}
