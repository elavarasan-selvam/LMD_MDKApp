export default function FormatPayerSubstatus(clientAPI) {
   let binding = clientAPI.binding;
   if (!binding || !binding.Payer) {
       return 'Payer: ';
   }
   let payer = binding.Payer.toString();
   // Remove leading zeros
   let formatted = payer.replace(/^0+/, '');
   return 'Payer: ' + formatted;
}