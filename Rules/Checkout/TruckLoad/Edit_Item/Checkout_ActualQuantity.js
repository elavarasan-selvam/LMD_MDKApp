export default function Checkout_ActualQuantity(clientAPI) {
    const appData = clientAPI.getAppClientData();

    const enteredQty = Number(appData.Checkout_Quantity || 0); // user entered
    const summedQty  = Number(appData.Edit_OrderedQty || 0);   // old sum

    const actualQty = enteredQty - summedQty;

    alert(
        "Old (summed) OrderedQuantity = " + summedQty +
        "\nNew Entered Quantity = " + enteredQty +
        "\nActualQuantity sent to backend = " + actualQty
    );

    return actualQty;
}
