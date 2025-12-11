import GetTotalStops from './GetTotalStops';
export default function GetProgressPctNum(context) {
   const done = context.getAppClientData().KPICompletedStops || 0;
   return GetTotalStops(context).then(total => {
       if (!total) return 0;
       const pct = Math.round((done / total) * 100);
       return Math.min(Math.max(pct, 0), 100);
   });
}