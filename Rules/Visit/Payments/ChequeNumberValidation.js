export default function CheckNumberValidation(clientAPI) {
   const pageProxy = clientAPI.getPageProxy();
   const checkControl = pageProxy.evaluateTargetPath(
       "#Page:Cheque_Collection_Payment/#Control:CheckNumberInput"
   );
   let checkNumber = checkControl.getValue();
   let numberRegex = /^[0-9]+$/;
   // Convert empty to invalid
   if (!checkNumber) {
       checkControl.setValidationProperty("ValidationMessage", "Check number is required.");
       checkControl.setValidationProperty("ValidationViewIsHidden", false);
       checkControl.redraw();
       return false;
   }
   if (!numberRegex.test(checkNumber)) {
       checkControl.setValidationProperty("ValidationMessage", "Check number should contain only digits.");
       checkControl.setValidationProperty("ValidationViewIsHidden", false);
       checkControl.redraw();
       return false;
   }
   if (checkNumber.length !== 12) {
       checkControl.setValidationProperty("ValidationMessage", "Check number must be exactly 12 digits.");
       checkControl.setValidationProperty("ValidationViewIsHidden", false);
       checkControl.redraw();
       return false;
   }
   // Clear if valid
   checkControl.clearValidation();
   checkControl.redraw();
   return true;
}