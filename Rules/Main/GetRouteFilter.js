// /LMD_MDKApp/Rules/GetRouteFilter.js
export default function GetRouteFilter(context) {
  const appCD = context.getAppClientData();
    if (appCD.RouteFilter) {
        //alert(" Using stored filter: " + appCD.RouteFilter);
        return appCD.RouteFilter;
    } else {
        //alert("No RouteFilter found, returning default");
        return "$filter=1 eq 0"; // prevent fetch
    }
}
