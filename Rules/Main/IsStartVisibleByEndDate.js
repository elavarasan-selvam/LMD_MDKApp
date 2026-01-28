export default function IsStartVisibleByEndDate(context) {
   const binding = context.getBindingObject();
   // Safety check
   if (!binding || !binding.StopUUID) {
       return false;
   }
   // If EndDateTime exists → stop already completed → hide START
   if (binding.EndDateTime) {
       return false;
   }
   // Not completed yet → show START
   return true;
}