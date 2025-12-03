// /LMD_MDKApp/Rules/GetRouteFilter.js
export default function GetPlannedDelivery(context) {
    const binding = context.binding;

    if (binding && binding.RouteUUID) {

        // Create filter string
        const filter = `$filter=IsReturn eq false and RouteUUID eq guid'${binding.RouteUUID}'`;

        // Show alert
       // alert("Using RouteUUID filter: " + filter);

        return filter;
    }

    alert("No RouteUUID found. Returning default filter.");
    return "$filter=1 eq 0";
}
