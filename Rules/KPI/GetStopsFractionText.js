import GetTotalStops from './GetTotalStops';
export default function GetStopsFractionText(context) {
   const app = context.getAppClientData();
   if (app.KPICompletedStops == null) app.KPICompletedStops = 0;
   const done = Number.isFinite(app.KPICompletedStops) ? app.KPICompletedStops : 0;
   return GetTotalStops(context).then(total => {
       const safeTotal = Number.isFinite(total) ? total : 0;
       return `        ${Math.min(done, safeTotal)} / ${safeTotal} Stops`;
   });
}