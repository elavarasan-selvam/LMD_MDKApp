export default function ValidateUnloadedQuantity(clientAPI) {
    const pageProxy = clientAPI.getPageProxy();

    // Get controls using evaluateTargetPath
    const unloadedControl = pageProxy.evaluateTargetPath(
        "#Page:ReloadCheckout_EditItem/#Control:SectionedTable0/#Control:UnloadedQuantityInput"
    );
    const actualControl = pageProxy.evaluateTargetPath(
        "#Page:ReloadCheckout_EditItem/#Control:SectionedTable0/#Control:FormCellSimpleProperty0"
    );

    // Get values
    let unloadedValue = unloadedControl.getValue();
    const actualValue = Number(actualControl.getValue()) || 0;

    // Convert unloaded to number safely
    unloadedValue = unloadedValue !== '' ? Number(unloadedValue) : NaN;

    // Validation: empty or zero
    if (!unloadedValue) {
        unloadedControl.setValidationProperty("ValidationMessage",
            "Unloaded quantity is required and must be greater than 0.");
        unloadedControl.setValidationProperty("ValidationViewIsHidden", false);
        unloadedControl.redraw(); // safe: redraw only the control
        return false;
    }
    // Validation: negative
    else if (unloadedValue < 0) {
        unloadedControl.setValidationProperty("ValidationMessage",
            "Unloaded quantity cannot be negative.");
        unloadedControl.setValidationProperty("ValidationViewIsHidden", false);
        unloadedControl.redraw(); // safe
        return false;
    }
    // Validation: greater than actual
    else if (unloadedValue > actualValue) {
        unloadedControl.setValidationProperty("ValidationMessage",
            "Unloaded quantity cannot be greater than Actual Quantity.");
        unloadedControl.setValidationProperty("ValidationViewIsHidden", false);
        unloadedControl.redraw(); // safe
        return false;
    }
    // If all validations pass
    else {
        unloadedControl.clearValidation();
        unloadedControl.redraw(); // safe
    }

    return true;
}
