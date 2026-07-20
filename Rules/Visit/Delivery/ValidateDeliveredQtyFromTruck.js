export default async function ValidateDeliveredQtyFromTruck(context) {

    //--------------------------------------------------
    // SUPPORT BOTH CALLS
    //--------------------------------------------------
    let pageProxy;
    let qtyControl;

    // OnValueChange
    if (context && typeof context.getValue === 'function') {
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
    // HELPER: SAFE NUMBER
    //--------------------------------------------------
    function getSafeNumber(value) {
        if (value === undefined || value === null || value === '') {
            return 0;
        }

        return Number(value) || 0;
    }

    //--------------------------------------------------
    // HELPER: READ ITEM SAFELY
    //--------------------------------------------------
    function getReadItem(result, index) {
        if (result && typeof result.getItem === 'function') {
            return result.getItem(index);
        }

        return result[index];
    }

    //--------------------------------------------------
    // HELPER: GET CONTROL VALUE SAFELY
    //--------------------------------------------------
    function getControlValue(control) {
        const value = control.getValue();

        if (Array.isArray(value)) {
            return value.length > 0 ? value[0] : '';
        }

        return value;
    }

    //--------------------------------------------------
    // HELPER: GET STOP SEQUENCE
    //--------------------------------------------------
    function getStopSequence(stop, index) {
        return Number(
            stop.Sequence ||
            stop.StopSequence ||
            stop.VisitSequence ||
            stop.SequenceNumber ||
            stop.SequenceNo ||
            stop.SortOrder ||
            (index + 1)
        );
    }

    //--------------------------------------------------
    // HELPER: GET UOM
    //--------------------------------------------------
    function getItemUOM(item) {
        return (
            item.ActualUOM ||
            item.OrderedUOM ||
            item.UOM ||
            item.BaseUOM ||
            ""
        );
    }

    //--------------------------------------------------
    // HELPER: CHECKOUT ACTUAL QTY
    //--------------------------------------------------
    function getCheckoutActualQuantity(item) {
        return (
            getSafeNumber(item.ActualQuantity) ||
            getSafeNumber(item.OrderedQuantityInput) ||
            getSafeNumber(item.OrderedQuantity) ||
            getSafeNumber(item.Quantity) ||
            0
        );
    }

    //--------------------------------------------------
    // HELPER: RELOAD CI ACTUAL QTY
    //--------------------------------------------------
    function getReloadCIActualQuantity(item) {
        return (
            getSafeNumber(item.ActualQuantity) ||
            getSafeNumber(item.OrderedQuantityInput) ||
            getSafeNumber(item.OrderedQuantity) ||
            getSafeNumber(item.Quantity) ||
            0
        );
    }

    //--------------------------------------------------
    // HELPER: RELOAD CI UNLOADED QTY
    //--------------------------------------------------
    function getReloadCIUnloadedQuantity(item) {
        return (
            getSafeNumber(item.UnloadedQuantity) ||
            getSafeNumber(item.ActualUnloadedQuantity) ||
            getSafeNumber(item.UnloadedQty) ||
            getSafeNumber(item.UnloadedQuantityInput) ||
            0
        );
    }

    //--------------------------------------------------
    // HELPER: RELOAD CO ACTUAL / LOADED QTY
    //--------------------------------------------------
    function getReloadCOActualQuantity(item) {
        return (
            getSafeNumber(item.ActualQuantity) ||
            getSafeNumber(item.LoadedQuantity) ||
            getSafeNumber(item.ActualLoadedQuantity) ||
            getSafeNumber(item.LoadedQty) ||
            getSafeNumber(item.OrderedQuantityInput) ||
            getSafeNumber(item.OrderedQuantity) ||
            getSafeNumber(item.Quantity) ||
            0
        );
    }

    //--------------------------------------------------
    // BASIC INPUT CHECK
    //--------------------------------------------------
    const rawValue = getControlValue(qtyControl);

    // Empty -> allow
    // Important: 0 should not be treated as empty
    if (rawValue === undefined || rawValue === null || rawValue === '') {
        qtyControl.clearValidation();
        qtyControl.redraw();
        return true;
    }

    const enteredQty = Number(rawValue);

    // Number check
    if (isNaN(enteredQty)) {
        qtyControl.setValidationProperty(
            "ValidationMessage",
            "Enter a valid number"
        );

        qtyControl.setValidationProperty(
            "ValidationViewIsHidden",
            false
        );

        qtyControl.redraw();
        return false;
    }

    // Negative check
    if (enteredQty < 0) {
        qtyControl.setValidationProperty(
            "ValidationMessage",
            "Delivered quantity cannot be negative"
        );

        qtyControl.setValidationProperty(
            "ValidationViewIsHidden",
            false
        );

        qtyControl.redraw();
        return false;
    }

    //--------------------------------------------------
    // BINDING DATA
    //--------------------------------------------------
    const binding = pageProxy.binding || {};

    const orderedQty = getSafeNumber(binding.OrderedQuantity);
    const routeUUID = binding.RouteUUID;
    const productID = binding.ProductID;
    const stopUUID = binding.StopUUID;
    const currentUOM =
        binding.OrderedUOM ||
        binding.ActualUOM ||
        binding.UOM ||
        "";

    if (!routeUUID || !productID || !stopUUID) {
        qtyControl.clearValidation();
        qtyControl.redraw();
        return true;
    }

    //--------------------------------------------------
    // FETCH ALL STOPS
    //--------------------------------------------------
    const stopsResult = await pageProxy.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'Stops',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}'`
    );

    let checkoutStopUUID = null;
    let reloadCIStopUUID = null;
    let reloadCOStopUUID = null;

    let currentStopSequence = null;
    let reloadCISequence = null;

    const stopSequenceMap = {};
    const stopTypeMap = {};

    if (stopsResult && stopsResult.length > 0) {

        for (let i = 0; i < stopsResult.length; i++) {

            const stop = getReadItem(stopsResult, i);

            if (!stop) {
                continue;
            }

            const sequence = getStopSequence(stop, i);

            stopSequenceMap[stop.StopUUID] = sequence;
            stopTypeMap[stop.StopUUID] = stop.StopType;

            if (stop.StopUUID === stopUUID) {
                currentStopSequence = sequence;
            }

            if (stop.StopType === 'CHECKOUT') {
                checkoutStopUUID = stop.StopUUID;
            }

            if (stop.StopType === 'RELOAD_CI') {
                reloadCIStopUUID = stop.StopUUID;
                reloadCISequence = sequence;
            }

            if (stop.StopType === 'RELOAD_CO') {
                reloadCOStopUUID = stop.StopUUID;
            }
        }
    }

    const hasReloadRequest = !!(reloadCIStopUUID && reloadCOStopUUID);

    //--------------------------------------------------
    // DECIDE VALIDATION BASE
    //
    // NO RELOAD:
    //      CHECKOUT
    //
    // RELOAD + CURRENT VISIT BEFORE RELOAD_CI:
    //      CHECKOUT
    //
    // RELOAD + CURRENT VISIT AFTER RELOAD_CI:
    //      RELOAD_CI / RELOAD_CO
    //--------------------------------------------------
    let isVisitAfterReloadCI = false;

    if (
        hasReloadRequest &&
        reloadCISequence !== null &&
        reloadCISequence !== undefined &&
        currentStopSequence !== null &&
        currentStopSequence !== undefined &&
        currentStopSequence > reloadCISequence
    ) {
        isVisitAfterReloadCI = true;
    }

    const useReloadDetails =
        hasReloadRequest &&
        isVisitAfterReloadCI;

    //--------------------------------------------------
    // FETCH DELIVERY ITEMS FOR SAME PRODUCT
    //--------------------------------------------------
    const orders = await pageProxy.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'DocumentItems',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}' and ProductID eq '${productID}' and IsReturn eq false`
    );

    let orderedSum = 0;
    let deliveredOtherStops = 0;
    let currentStopSavedDeliveredQty = 0;

    if (orders && orders.length > 0) {

        for (let i = 0; i < orders.length; i++) {

            const item = getReadItem(orders, i);

            if (!item) {
                continue;
            }

            const itemStopUUID = item.StopUUID;
            const itemStopSeq = stopSequenceMap[itemStopUUID];
            const itemStopType = stopTypeMap[itemStopUUID];

            // Only VISIT items should be used for delivered comparison
            if (itemStopType && itemStopType !== 'VISIT') {
                continue;
            }

            let includeThisItem = true;

            if (hasReloadRequest) {

                if (useReloadDetails) {

                    // Current visit is after RELOAD_CI.
                    // Compare only visits after RELOAD_CI.
                    includeThisItem =
                        itemStopSeq !== undefined &&
                        itemStopSeq !== null &&
                        itemStopSeq > reloadCISequence;

                } else {

                    // Current visit is before RELOAD_CI.
                    // Compare only visits before RELOAD_CI.
                    includeThisItem =
                        itemStopSeq !== undefined &&
                        itemStopSeq !== null &&
                        itemStopSeq < reloadCISequence;
                }
            }

            if (!includeThisItem) {
                continue;
            }

            orderedSum += getSafeNumber(item.OrderedQuantity);

            // Edit mode:
            // Exclude current stop delivered qty because enteredQty is replacing it.
            if (itemStopUUID === stopUUID) {
                currentStopSavedDeliveredQty += getSafeNumber(item.DeliveredQuantity);
            } else {
                deliveredOtherStops += getSafeNumber(item.DeliveredQuantity);
            }
        }
    }

    //--------------------------------------------------
    // CALCULATE TRUCK STOCK
    //--------------------------------------------------
    let truckStock = 0;
    let baseSource = "";

    if (useReloadDetails) {

        //--------------------------------------------------
        // RELOAD FLOW
        //
        // For visits after RELOAD_CI:
        //
        // TruckStock =
        //      RELOAD_CI Remaining
        //      +
        //      RELOAD_CO Actual
        //
        // RELOAD_CI Remaining =
        //      ActualQuantity - UnloadedQuantity
        //--------------------------------------------------
        let reloadCIRemainingQty = 0;
        let reloadCOActualQty = 0;

        //--------------------------------------------------
        // READ RELOAD_CI COCIProducts
        //--------------------------------------------------
        if (reloadCIStopUUID) {

            try {

                const reloadCIProducts = await pageProxy.read(
                    '/LMD_MDKApp/Services/LMD_MA.service',
                    'COCIProducts',
                    [],
                    `$filter=ProductID eq '${productID}' and StopUUID eq guid'${reloadCIStopUUID}'`
                );

                if (reloadCIProducts && reloadCIProducts.length > 0) {

                    for (let i = 0; i < reloadCIProducts.length; i++) {

                        const reloadCIItem = getReadItem(reloadCIProducts, i);

                        if (!reloadCIItem) {
                            continue;
                        }

                        const itemUOM = getItemUOM(reloadCIItem);

                        // Match UOM if both are available
                        if (currentUOM && itemUOM && currentUOM !== itemUOM) {
                            continue;
                        }

                        const actualQty = getReloadCIActualQuantity(reloadCIItem);
                        const unloadedQty = getReloadCIUnloadedQuantity(reloadCIItem);

                        let remainingQty = actualQty - unloadedQty;

                        if (remainingQty < 0) {
                            remainingQty = 0;
                        }

                        reloadCIRemainingQty += remainingQty;
                    }
                }

            } catch (e) {
                reloadCIRemainingQty = 0;
            }
        }

        //--------------------------------------------------
        // READ RELOAD_CO COCIProducts
        //--------------------------------------------------
        if (reloadCOStopUUID) {

            try {

                const reloadCOProducts = await pageProxy.read(
                    '/LMD_MDKApp/Services/LMD_MA.service',
                    'COCIProducts',
                    [],
                    `$filter=ProductID eq '${productID}' and StopUUID eq guid'${reloadCOStopUUID}'`
                );

                if (reloadCOProducts && reloadCOProducts.length > 0) {

                    for (let i = 0; i < reloadCOProducts.length; i++) {

                        const reloadCOItem = getReadItem(reloadCOProducts, i);

                        if (!reloadCOItem) {
                            continue;
                        }

                        const itemUOM = getItemUOM(reloadCOItem);

                        // Match UOM if both are available
                        if (currentUOM && itemUOM && currentUOM !== itemUOM) {
                            continue;
                        }

                        reloadCOActualQty += getReloadCOActualQuantity(reloadCOItem);
                    }
                }

            } catch (e) {
                reloadCOActualQty = 0;
            }
        }

        truckStock =
            getSafeNumber(reloadCIRemainingQty) +
            getSafeNumber(reloadCOActualQty);

        baseSource = "RELOAD_COCI";

        // If reload COCIProducts are missing or zero,
        // use normal ordered quantity fallback.
        if (truckStock <= 0) {
            truckStock = orderedSum;
            baseSource = "RELOAD_ORDERED_FALLBACK";
        }

    } else {

        //--------------------------------------------------
        // NORMAL / BEFORE RELOAD FLOW
        //
        // No reload OR visit before RELOAD_CI:
        //
        // Use CHECKOUT COCI ActualQuantity.
        // If Checkout COCI qty is missing or zero,
        // use normal OrderedQuantity.
        //--------------------------------------------------
        let checkoutActualQty = 0;
        let hasCheckoutActualQty = false;

        if (checkoutStopUUID) {

            try {

                const checkoutCOCIProducts = await pageProxy.read(
                    '/LMD_MDKApp/Services/LMD_MA.service',
                    'COCIProducts',
                    [],
                    `$filter=ProductID eq '${productID}' and StopUUID eq guid'${checkoutStopUUID}'`
                );

                if (checkoutCOCIProducts && checkoutCOCIProducts.length > 0) {

                    for (let i = 0; i < checkoutCOCIProducts.length; i++) {

                        const checkoutItem = getReadItem(checkoutCOCIProducts, i);

                        if (!checkoutItem) {
                            continue;
                        }

                        const itemUOM = getItemUOM(checkoutItem);

                        // Match UOM if both are available
                        if (currentUOM && itemUOM && currentUOM !== itemUOM) {
                            continue;
                        }

                        const qty = getCheckoutActualQuantity(checkoutItem);

                        checkoutActualQty += qty;

                        if (qty > 0) {
                            hasCheckoutActualQty = true;
                        }
                    }
                }

            } catch (e) {
                checkoutActualQty = 0;
                hasCheckoutActualQty = false;
            }
        }

        // IMPORTANT:
        // If Checkout COCI qty exists and > 0, use it.
        // If no Checkout COCIProducts qty, use normal ordered quantity.
        truckStock =
            hasCheckoutActualQty && checkoutActualQty > 0
                ? checkoutActualQty
                : orderedSum;

        baseSource =
            hasCheckoutActualQty && checkoutActualQty > 0
                ? "CHECKOUT_COCI"
                : "ORDERED_FALLBACK";
    }

    //--------------------------------------------------
    // REMAINING TRUCK
    //
    // deliveredOtherStops excludes the current stop.
    // This is correct for edit mode because enteredQty
    // is replacing current delivered quantity.
    //--------------------------------------------------
    const remainingTruck =
        getSafeNumber(truckStock) -
        getSafeNumber(deliveredOtherStops);

    //--------------------------------------------------
    // CUSTOMER LIMIT
    //--------------------------------------------------
    const allowedQty =
        Math.min(
            getSafeNumber(remainingTruck),
            getSafeNumber(orderedQty)
        );

    /*
    alert(
        "DELIVERY VALIDATION" +
        "\nProduct: " + productID +
        "\nRouteUUID: " + routeUUID +
        "\nStopUUID: " + stopUUID +
        "\nCurrent Stop Sequence: " + currentStopSequence +
        "\nHas Reload: " + hasReloadRequest +
        "\nReload CI Sequence: " + reloadCISequence +
        "\nUse Reload Details: " + useReloadDetails +
        "\nBase Source: " + baseSource +
        "\nOrdered Qty Current Customer: " + orderedQty +
        "\nOrdered Sum Scope: " + orderedSum +
        "\nTruck Stock: " + truckStock +
        "\nCurrent Stop Saved Delivered: " + currentStopSavedDeliveredQty +
        "\nDelivered Other Stops: " + deliveredOtherStops +
        "\nRemaining Truck: " + remainingTruck +
        "\nAllowed Qty: " + allowedQty +
        "\nEntered Qty: " + enteredQty
    );
    */

    //--------------------------------------------------
    // INLINE VALIDATION
    //--------------------------------------------------
    if (enteredQty > allowedQty) {

        qtyControl.setValidationProperty(
            "ValidationMessage",
            "Cannot deliver more than " + allowedQty + ". Truck remaining: " + remainingTruck
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