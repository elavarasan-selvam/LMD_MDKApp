export default async function ValidateDeliveredQtyFromTruck(context) {

    //--------------------------------------------------
    // SUPPORT BOTH CALLS
    //--------------------------------------------------
    let pageProxy;
    let qtyControl;

    // OnValueChange
    if (typeof context.getValue === 'function') {
        qtyControl = context;
        pageProxy = context.getPageProxy();
    }
    // OnSave
    else {
        pageProxy = context.getPageProxy();
        qtyControl = pageProxy.evaluateTargetPath(
            "#Page:MyVisit_EditItem/#Control:SectionedTable0/#Control:FCDeliveredQuantity"
        );
    }

    //--------------------------------------------------
    // BASIC INPUT CHECK
    //--------------------------------------------------
    const rawValue = qtyControl.getValue();

    // empty → allow
    if (!rawValue) {
        qtyControl.clearValidation();
        qtyControl.redraw();
        return true;
    }

    const enteredQty = Number(rawValue);

    // number check
    if (isNaN(enteredQty)) {
        qtyControl.setValidationProperty("ValidationMessage", "Enter a valid number");
        qtyControl.setValidationProperty("ValidationViewIsHidden", false);
        qtyControl.redraw();
        return false;
    }

    //--------------------------------------------------
    // BINDING DATA
    //--------------------------------------------------
    const binding = pageProxy.binding;

    const orderedQty = Number(binding.OrderedQuantity || 0);
    const routeUUID  = binding.RouteUUID;
    const productID  = binding.ProductID;
    const stopUUID   = binding.StopUUID;

    //--------------------------------------------------
    // FIND CHECKOUT STOP
    //--------------------------------------------------
    const stopResult = await pageProxy.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'Stops',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKOUT'`
    );

    if (!stopResult || stopResult.length === 0) {
        qtyControl.clearValidation();
        qtyControl.redraw();
        return true;
    }

    const checkoutStopUUID = stopResult.getItem(0).StopUUID;

    //--------------------------------------------------
    // TRUCK ACTUAL QUANTITY
    //--------------------------------------------------
    const cociResult = await pageProxy.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'COCIProducts',
        [],
        `$filter=ProductID eq '${productID}' and StopUUID eq guid'${checkoutStopUUID}'`
    );

    let actualQty = 0;
    let hasActual = false;

    if (cociResult && cociResult.length > 0) {
        actualQty = Number(cociResult.getItem(0).ActualQuantity || 0);
        hasActual = true;
    }

    //--------------------------------------------------
    // ALL ROUTE DELIVERIES
    //--------------------------------------------------
    const orders = await pageProxy.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'DocumentItems',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}' and ProductID eq '${productID}'`
    );

    let orderedSum = 0;
    let deliveredOtherStops = 0;

    if (orders && orders.length > 0) {
        orders.forEach(item => {
            orderedSum += Number(item.OrderedQuantity || 0);

            // exclude current stop
            if (item.StopUUID !== stopUUID) {
                deliveredOtherStops += Number(item.DeliveredQuantity || 0);
            }
        });
    }

    //--------------------------------------------------
    // FINAL TRUCK STOCK
    //--------------------------------------------------
    const finalTruckQty = hasActual
        ? orderedSum + actualQty
        : orderedSum;

    const remainingTruck = finalTruckQty - deliveredOtherStops;

    //--------------------------------------------------
    // CUSTOMER LIMIT
    //--------------------------------------------------
    const allowedQty = Math.min(remainingTruck, orderedQty);

    //--------------------------------------------------
    // INLINE VALIDATION
    //--------------------------------------------------
    if (enteredQty > allowedQty) {

        qtyControl.setValidationProperty(
            "ValidationMessage",
            `Cannot deliver more than ${allowedQty}. Truck remaining: ${remainingTruck}`
        );

        qtyControl.setValidationProperty(
            "ValidationViewIsHidden",
            false
        );

        qtyControl.redraw();
        return false;
    }

    //--------------------------------------------------
    // VALID CASE
    //--------------------------------------------------
    qtyControl.clearValidation();
    qtyControl.redraw();
    return true;
}
