export default function GetPaymentTypes(context) {
   return [
       { DisplayValue: 'Cash',   ReturnValue: 'Cash' },
       { DisplayValue: 'Cheque', ReturnValue: 'Cheque' },
       // if you need one more like “Selection Method”, keep it just as a label:
       // { DisplayValue: 'Selection Method', ReturnValue: '' }
   ];
}