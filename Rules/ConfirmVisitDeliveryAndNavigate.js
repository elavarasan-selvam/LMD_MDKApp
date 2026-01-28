export default function ConfirmVisitDeliveryAndNavigate(context) {
 const appCD = context.getAppClientData();
 const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;
 if (stopUUID) {
   if (!appCD.DeliveryConfirmedByStop) {
     appCD.DeliveryConfirmedByStop = {};
   }
   appCD.DeliveryConfirmedByStop[stopUUID] = true;
 }
 // 1️⃣ Show toast message
 return context.executeAction('/LMD_MDKApp/Actions/MyVisit/ShowDeliveryToast.action')
   .then(() => {
     // 2️⃣ Navigate back to Visit page
     return context.executeAction('/LMD_MDKApp/Actions/ClosePage.action');
   });
}