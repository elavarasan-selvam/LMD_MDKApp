import GetStopFilter from '../Main/GetStopFilter';
export default function GetTotalStops(context) {
   const service = '/LMD_MDKApp/Services/LMD_MA.service';
   // Get the same QueryOptions string that the Stops section uses
   const queryOptions = GetStopFilter(context);
   // If GetStopFilter returns a Promise, handle that too
   if (queryOptions && typeof queryOptions.then === 'function') {
       return queryOptions.then(q =>
           context.read(service, 'Stops', [], q)
               .then(res => (res && res.length) ? res.length : 0)
       );
   }
   // Normal (sync) case – GetStopFilter returns a string
   return context.read(service, 'Stops', [], queryOptions)
       .then(res => (res && res.length) ? res.length : 0);
}