/* GetStopInfo.js */
export default async function GetStopInfo(context) {
   let stop = context.binding;
   if (!stop) return '';
   const stopType = stop.StopType;
   // CASE 1: VISIT -> try to use the navigation property first (to_Address)
  if (stopType === 'VISIT') {
       try {
           // If address navigation property already exists, use CompleteAddress directly
           if (stop.to_Address && Array.isArray(stop.to_Address) && stop.to_Address.length > 0) {
               const addr = stop.to_Address[0];
               if (addr.CompleteAddress) {
                   return addr.CompleteAddress;
               }
           }
           // Otherwise, fallback to cross-service fetch using LocationAddressID
           const addressKey = stop.AddressID || stop.AddressNumber || stop.LocationAddressID;
           if (!addressKey) {
               return 'No address ID available';
           }
           // Use address lookup service
           const service = '/LMD_MDKApp/Services/MD_BUSINESSPARTNER_SRV.service';
           const entity = 'C_BPAddressValueHelp';
           const filter = `$filter=AddressNumber eq '${addressKey}'`;
           const result = await context.read(service, entity, [], filter);
           if (result && result.length > 0) {
               const address = result.getItem(0);
               return address.CompleteAddress || 'Address not available';
           }
           return 'Address not found';
       } catch (error) {
           console.error('Error fetching VISIT address:', error);
           return 'Error fetching address';
       }
   }
   // CASE 2: CHECKIN / CHECKOUT -> same as before (fetch vehicle from Routes)
   if ((stopType === 'CHECKIN' || stopType === 'CHECKOUT') && stop.RouteUUID) {
       const service = '/LMD_MDKApp/Services/LMD_MA.service';
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