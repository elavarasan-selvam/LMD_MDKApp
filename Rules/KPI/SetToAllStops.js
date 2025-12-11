import GetTotalStops from './GetTotalStops';
export default function SetToAllStops(context) {
   const appCD = context.getAppClientData();
   return GetTotalStops(context).then(total => {
       appCD.KPICompletedStops = total;
       return true;
   });
}