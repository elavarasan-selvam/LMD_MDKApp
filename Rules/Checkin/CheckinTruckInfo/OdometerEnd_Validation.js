export default function ValidateOdometerEnd(clientAPI) {
    const pageProxy = clientAPI.getPageProxy();

    const odometerBegin = Number(pageProxy.evaluateTargetPath("#Page:TruckInfo/#Control:FormCellSimpleProperty0/#Value")) || 0;
    const odometerEndControl = pageProxy.evaluateTargetPath("#Page:TruckInfo/#Control:OdometerEndInput");

    let odometerEnd = odometerEndControl.getValue();
    odometerEnd = odometerEnd !== '' ? Number(odometerEnd) : NaN;

    if (isNaN(odometerEnd) || odometerEnd < 0) {
        odometerEndControl.setValidationProperty("ValidationMessage", "Odometer End must be a positive number.");
        odometerEndControl.setValidationProperty("ValidationViewIsHidden", false);
        odometerEndControl.redraw();  // <-- Safe: redraw only this control
        return false;
    } else if (odometerEnd <= odometerBegin) {
        odometerEndControl.setValidationProperty("ValidationMessage", "Odometer End must be greater than Odometer Begin.");
        odometerEndControl.setValidationProperty("ValidationViewIsHidden", false);
        odometerEndControl.redraw();  // <-- Safe
        return false;
    } else {
        odometerEndControl.clearValidation();
        odometerEndControl.redraw();  // <-- Safe
    }

    return true;
}
