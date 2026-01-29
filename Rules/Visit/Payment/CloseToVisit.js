export default async function CloseToVisit(context) {
   const appCD = context.getAppClientData();
   const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;
   if (!appCD.CollectionPaymentConfirmed) {
       appCD.CollectionPaymentConfirmed = {};
   }
   if (stopUUID) {
       appCD.CollectionPaymentConfirmed[stopUUID] = true;
   }
   // ✅ ADD THIS LINE (toast)
   await context.executeAction('/LMD_MDKApp/Actions/MyVisit/Payment/CashPaymentToast.action');
   // ✅ KEEP all your ClosePage calls
   //await context.executeAction('/LMD_MDKApp/Actions/ClosePage.action');
   //await context.executeAction('/LMD_MDKApp/Actions/ClosePage.action');
   await context.executeAction('/LMD_MDKApp/Actions/ClosePage.action');
   return context.executeAction('/LMD_MDKApp/Actions/ClosePage.action');
}