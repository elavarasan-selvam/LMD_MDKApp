import GetTotalStops from './GetTotalStops';
export default function GetProgressFraction(context) {
 const done = context.getAppClientData().KPICompletedStops || 0;
 return GetTotalStops(context).then(total => {
   const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
   if (safeTotal === 0) {
     return 0; // no movement when no stops
   }
   let fraction = done / safeTotal;
   if (fraction < 0) fraction = 0;
   if (fraction > 1) fraction = 1;
   return fraction; // value between 0 and 1
 });
}