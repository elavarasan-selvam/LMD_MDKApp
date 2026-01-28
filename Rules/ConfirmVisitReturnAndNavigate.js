export default function ConfirmVisitReturnAndNavigate(context) {
 const appCD = context.getAppClientData();
 const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;
 if (stopUUID) {
   appCD.ReturnConfirmedByStop[stopUUID] = true;
 }
 // 1️⃣ Show Toast Message
 return context.executeAction('/LMD_MDKApp/Actions/MyVisit/ShowVisitReturnToast.action')
   .then(() => {
     // 2️⃣ Close Page after toast is triggered
     return context.executeAction('/LMD_MDKApp/Actions/ClosePage.action');
   });
}