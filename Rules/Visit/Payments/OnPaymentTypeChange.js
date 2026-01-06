export default function OnPaymentTypeChange(controlProxy) {
   // controlProxy = List Picker control
   let pageProxy = controlProxy.getPageProxy();
   // Get selected value from List Picker
   let value = controlProxy.getValue();
   // 1) If it is an array (typical for List Picker)
   if (Array.isArray(value)) {
       if (value.length > 0) {
           let v0 = value[0];
           if (typeof v0 === 'object') {
               // Rule-based picker items: {DisplayValue, ReturnValue}
               value = v0.ReturnValue || v0.DisplayValue;
           } else {
               // Simple string collection: ['Cash', 'Cheque']
               value = v0;
           }
       } else {
           value = '';
       }
   }
   // 2) If it is a single object
   else if (value && typeof value === 'object') {
       value = value.ReturnValue || value.DisplayValue;
   }
   // Now value should be 'Cash' or 'Cheque'
   if (value === 'Cash') {
       return pageProxy.executeAction(
           '/LMD_MDKApp/Actions/MyVisit/Payment/Nav_To_Cash_Collection_Payment.action'
       );
   }
   if (value === 'Cheque') {
       return pageProxy.executeAction(
           '/LMD_MDKApp/Actions/StartMyVisit/VisitPayment/NavToChequePayment.action'
       );
   }
   // Fallback – do nothing
   return Promise.resolve(true);
}