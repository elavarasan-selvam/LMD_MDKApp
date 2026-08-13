
export default function ValidateMobileSalesDocument(clientAPI) {

    const pageProxy = clientAPI.getPageProxy();

    // Get controls
    const productControl =
        pageProxy.evaluateTargetPath('#Control:MobileSalesProductID');

    const orderedQuantityControl =
        pageProxy.evaluateTargetPath('#Control:FCOrderedQuantity');

    const customerReferenceControl =
        pageProxy.evaluateTargetPath('#Control:FormCellSimpleProperty4');

    const customerRelevantOrderControl =
        pageProxy.evaluateTargetPath('#Control:FormCellSimpleProperty3');

    // Get values
    const product = productControl.getValue();
    const orderedQuantity = orderedQuantityControl.getValue();
    const customerReference = customerReferenceControl.getValue();
    const customerRelevantOrder = customerRelevantOrderControl.getValue();

    let isValid = true;

    // --------------------------------------------------
    // Product ID Validation
    // --------------------------------------------------
    if (!product || product.length === 0) {

        productControl.setValidationProperty(
            "ValidationMessage",
            "Please select a Product ID."
        );

        productControl.setValidationProperty(
            "ValidationViewIsHidden",
            false
        );

        productControl.redraw();

        isValid = false;

    } else {

        productControl.clearValidation();
        productControl.redraw();
    }


    // --------------------------------------------------
    // Ordered Quantity Validation
    // --------------------------------------------------
    if (
        orderedQuantity === null ||
        orderedQuantity === undefined ||
        orderedQuantity === "" ||
        isNaN(Number(orderedQuantity)) ||
        Number(orderedQuantity) <= 0
    ) {

        orderedQuantityControl.setValidationProperty(
            "ValidationMessage",
            "Ordered Quantity must be greater than 0."
        );

        orderedQuantityControl.setValidationProperty(
            "ValidationViewIsHidden",
            false
        );

        orderedQuantityControl.redraw();

        isValid = false;

    } else {

        orderedQuantityControl.clearValidation();
        orderedQuantityControl.redraw();
    }


    // --------------------------------------------------
    // Customer Reference Number Validation
    // --------------------------------------------------
    if (
        !customerReference ||
        customerReference.trim() === ""
    ) {

        customerReferenceControl.setValidationProperty(
            "ValidationMessage",
            "Customer Reference Number is required."
        );

        customerReferenceControl.setValidationProperty(
            "ValidationViewIsHidden",
            false
        );

        customerReferenceControl.redraw();

        isValid = false;

    } else {

        customerReferenceControl.clearValidation();
        customerReferenceControl.redraw();
    }


    // --------------------------------------------------
    // Customer Relevant Order Number Validation
    // --------------------------------------------------
    if (
        !customerRelevantOrder ||
        customerRelevantOrder.trim() === ""
    ) {

        customerRelevantOrderControl.setValidationProperty(
            "ValidationMessage",
            "Customer Relevant Order Number is required."
        );

        customerRelevantOrderControl.setValidationProperty(
            "ValidationViewIsHidden",
            false
        );

        customerRelevantOrderControl.redraw();

        isValid = false;

    } else {

        customerRelevantOrderControl.clearValidation();
        customerRelevantOrderControl.redraw();
    }


    // Return validation result
    return isValid;
}

