/* GetStopInfo.js */
export default function GetStopInfo(context) {
   let stop = context.binding;
   if (!stop) return '';
   const stopType = stop.StopType;
   // CASE 1: VISIT -> try to use the navigation property first (to_Address)
   if (stopType === 'VISIT') {
       // 1) If the navigation property is already present on the binding (from offline store), use it
       if (stop.to_Address && Array.isArray(stop.to_Address) && stop.to_Address.length > 0) {
           const addr = stop.to_Address[0];
           const City = addr.City || '';
           const postal = addr.PostalCode || '';
           const country = addr.Country || '';
           return `${city} ${postal} ${country}`.trim();
       }
       // 2) Otherwise fallback to reading the Addresses entity with filter on AddressNumber
       // ensure AddressNumber exists on Stop - it may be called AddressID on Stop in your metadata
       const addressKey = stop.AddressID; // try common names
       if (!addressKey) {
           return '';
       }
       // The AddressNumber in metadata is a string (Edm.String) -> quote the value
       const service = '/LMD_MDKApp/Services/DEST_SAMSMA_PPROP.service';
       const entity = 'Addresses';
       const filter = `$filter=AddressNumber eq '${addressKey}'`;
       return context.read(service, entity, [], filter).then(result => {
           if (result && result.length > 0) {
               const address = result.getItem(0);
               const city = address.City || '';
               const postal = address.PostalCode || '';
               const country = address.Country || '';
               return ` ${city} ${postal} ${country}`.trim();
           }
           return '';
       }).catch(err => {
           // swallow error but you can log for debugging:
           // console.log('GetStopInfo - read Addresses error', err);
           return '';
       });
   }
   // CASE 2: CHECKIN / CHECKOUT -> same as before (fetch vehicle from Routes)
   if ((stopType === 'CHECKIN' || stopType === 'CHECKOUT') && stop.RouteUUID) {
       const service = '/LMD_MDKApp/Services/DEST_SAMSMA_PPROP.service';
       const entity = 'Routes';
       const filter = `$filter=RouteUUID eq guid'${stop.RouteUUID}'`;
       return context.read(service, entity, [], filter).then(result => {
           if (result && result.length > 0) {
               const vehicleId = result.getItem(0).VehicleID || '';
               return vehicleId ? `My Truck: ${vehicleId}` : '';
           }
           return '';
       }).catch(() => {
           return '';
       });
   }
   return '';
}