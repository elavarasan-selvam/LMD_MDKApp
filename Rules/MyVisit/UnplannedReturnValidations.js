export default function ValidateUnplannedReturn(clientAPI) {

    const pageProxy = clientAPI.getPageProxy();

    const productControl = pageProxy.evaluateTargetPath('#Control:FormCellListPicker0');
    const currencyControl = pageProxy.evaluateTargetPath('#Control:FormCellSimpleProperty2');
    const quantityControl = pageProxy.evaluateTargetPath('#Control:FormCellSimpleProperty3');

    const product = productControl.getValue();
    const currency = currencyControl.getValue();
    const quantity = quantityControl.getValue();

    let isValid = true;

    // Product ID Validation
    if (!product || product.length === 0) {
        productControl.setValidationProperty("ValidationMessage", "Please select a Product ID.");
        productControl.setValidationProperty("ValidationViewIsHidden", false);
        productControl.redraw();
        isValid = false;
    } else {
        productControl.clearValidation();
        productControl.redraw();
    }

    // Currency Validation
    if (!currency || currency.trim() === "") {
        currencyControl.setValidationProperty("ValidationMessage", "Currency is required.");
        currencyControl.setValidationProperty("ValidationViewIsHidden", false);
        currencyControl.redraw();
        isValid = false;
    } else {
        currencyControl.clearValidation();
        currencyControl.redraw();
    }

    // Returning Quantity Validation
    if (
        quantity === null ||
        quantity === undefined ||
        quantity === "" ||
        isNaN(Number(quantity)) ||
        Number(quantity) <= 0
    ) {
        quantityControl.setValidationProperty(
            "ValidationMessage",
            "Returning Quantity must be greater than 0."
        );
        quantityControl.setValidationProperty("ValidationViewIsHidden", false);
        quantityControl.redraw();
        isValid = false;
    } else {
        quantityControl.clearValidation();
        quantityControl.redraw();
    }

    return isValid;
}