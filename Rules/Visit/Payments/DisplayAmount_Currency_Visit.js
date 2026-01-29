export default async function DisplayAmount_Currency_Visit(clientAPI) {
   const binding = clientAPI.getPageProxy().binding;
   if (!binding || !binding.StopUUID) {
       return '';
   }
   try {
       // 1️⃣ Read Collection for this Stop
       const collections = await clientAPI.read(
           '/LMD_MDKApp/Services/LMD_MA.service',
           'Collections',
           [],
           `$filter=StopUUID eq guid'${binding.StopUUID}'`
       );
       if (!collections || collections.length === 0) {
           return '';
       }
       const collection = collections.getItem(0);
       const currency = collection.Currency;
       // 2️⃣ Read ALL payments for this collection
       const payments = await clientAPI.read(
           '/LMD_MDKApp/Services/LMD_MA.service',
           'CollectionPayments',
           [],
           collection['@odata.readLink'] + '/to_CollectionPayments'
       );
       if (!payments || payments.length === 0) {
           return '';
       }
       // 3️⃣ Prefer CHEQUE over CASH
       let selectedPayment = null;
       payments.forEach(p => {
           if (p.PaymentType === 'CH') {
               selectedPayment = p;
           }
       });
       // 4️⃣ Fallback to CASH
       if (!selectedPayment) {
           payments.forEach(p => {
               if (p.PaymentType === 'CA') {
                   selectedPayment = p;
               }
           });
       }
       if (!selectedPayment || selectedPayment.Amount == null) {
           return '';
       }
       const label = selectedPayment.PaymentType === 'CH' ? 'Cheque' : 'Cash';
       return `${label} ${currency} ${selectedPayment.Amount}`;
   } catch (e) {
       return '';
   }
}