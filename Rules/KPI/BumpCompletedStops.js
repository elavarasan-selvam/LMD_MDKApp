export default function BumpCompletedStops(context) {
   const appCD = context.getAppClientData();
   appCD.KPICompletedStops = (appCD.KPICompletedStops || 0) + 1;
   // After incrementing, run the RefreshMain.action to update KPI UI
   return context.executeAction('/LMD_MDKApp/Actions/StartCheckout/NavToMainPagefromCompleteCheckout.action');
}


