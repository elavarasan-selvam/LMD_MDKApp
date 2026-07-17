/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 * /
 export default function ReloadCheckout_ActualQuantity(clientAPI) {

    const appData = clientAPI.getAppClientData();

    const enteredQty =
        Number(appData.Checkout_Quantity || 0);

    const summedQty =
        Number(appData.Edit_OrderedQty || 0);

    return enteredQty - summedQty;
}
    /**
export default function ReloadCheckout_ActualQuantity(clientAPI) {
    const appData = clientAPI.getAppClientData();
    alert(JSON.stringify(appData));

//    const reenteredQty = Number(appData.Reload_OrderedQty || 0); // user entered
    const reenteredQty = Number(appData.Reload_Quantity || 0); // user entered
//    const resummedQty  = Number(appData.OrderedQuantity || 0);   // old sum
    const resummedQty  = Number(appData.reoldQty || 0);   // old sum
    
    

    const reactualQty = reenteredQty - resummedQty;

    alert("Old (summed) OrderedQuantity = " + resummedQty +"\nNew Entered Quantity = " + reenteredQty +"\nActualQuantity sent to backend = " + reactualQty);
    return reactualQty;
}

export default function ReloadCheckout_ActualQuantity(clientAPI) {

    const appData = clientAPI.getAppClientData();
    alert(JSON.stringify(appData));
    //const enteredQty = Number(appData.Reload_Quantity || 0);
    const enteredQty =Number(appData.Checkout_Quantity || 0);
    //const summedQty = Number(appData.reoldQty || 0);
    const summedQty =Number(appData.Edit_OrderedQty || 0);

    const actualQty = enteredQty - summedQty;

    alert(
        "Old = " + summedQty +
        "\nNew = " + enteredQty +
        "\nActual = " + actualQty
    );

    return actualQty;
}*/

/**export default function ReloadCheckout_ActualQuantity(clientAPI) {

    const appData = clientAPI.getAppClientData();
    alert(JSON.stringify(appData));

    const enteredQty =
        Number(appData.Checkout_Quantity || 0);

    const summedQty =
        Number(appData.Edit_OrderedQty || 0);
alert(
        "Old = " + summedQty +
        "\nNew = " + enteredQty +
        "\nActual = " + actualQty
    );
    return enteredQty - summedQty;
}*/
export default function ReloadCheckout_ActualQuantity(clientAPI) {

    const appData = clientAPI.getAppClientData();

    const enteredQty = Number(appData.Checkout_Quantity ?? 0);
    const oldQty = Number(appData.Edit_OrderedQty ?? 0);

    if (isNaN(enteredQty) || isNaN(oldQty)) {
    /**    alert(
            "Invalid quantity.\n" +
            "Checkout_Quantity=" + appData.Checkout_Quantity +
            "\nEdit_OrderedQty=" + appData.Edit_OrderedQty
        );*/
        return 0;
    }

    const actualQty = enteredQty - oldQty;

   /**  alert(
        "Entered = " + enteredQty +
        "\nOld = " + oldQty +
        "\nActual = " + actualQty
    );*/

    return actualQty;
}