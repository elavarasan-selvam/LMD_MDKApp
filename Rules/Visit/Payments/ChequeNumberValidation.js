export default function CheckNumberValidation(clientAPI) {
   let pageProxy = clientAPI.getPageProxy();
   let checkControl = pageProxy.evaluateTargetPath(
       "#Page:Cheque_Collection_Payment/#Control:CheckNumberInput"
   );
   let checkNumber = checkControl.getValue();
   let numberRegex = /^[0-9]+$/;
   if (!checkNumber) {
       checkControl.setValidationProperty("ValidationMessage",
           "Check number is required.");
       checkControl.setValidationProperty("ValidationViewIsHidden", false);
       pageProxy.redraw();
       return false;
   } else if (!numberRegex.test(checkNumber)) {
       checkControl.setValidationProperty("ValidationMessage",
           "Check number should contain only digits.");
       checkControl.setValidationProperty("ValidationViewIsHidden", false);
       pageProxy.redraw();
       return false;
   } else if (checkNumber.length !== 12) {
       checkControl.setValidationProperty("ValidationMessage",
           "Check number must be exactly 12 digits.");
       checkControl.setValidationProperty("ValidationViewIsHidden", false);
       pageProxy.redraw();
       return false;
   } else {
       checkControl.clearValidation();
       pageProxy.redraw();
       return true;
   }
}