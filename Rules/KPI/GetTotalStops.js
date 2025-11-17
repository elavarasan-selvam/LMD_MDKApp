export default function GetTotalStops(context) {
 const service = '/LMD_MDKApp/Services/LMD_MA.service';
 const query = `$orderby=RouteUUID desc, Sequence asc&$top=3`; // your filter
 return context.read(service, 'Stops', [], query)
   .then(res => (res && res.length) ? res.length : 0);
}