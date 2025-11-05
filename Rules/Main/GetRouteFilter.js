// /LMD_MDKApp/Rules/GetRouteFilter.js
export default function GetRouteFilter(context) {
    //let appCD = context.getAppClientData();
    //let uuid = appCD.EarliestRouteUUID;

    //if (!uuid) {
        //alert("No EarliestRouteUUID found in AppClientData.");
      //  return "$filter=1 eq 0"; // prevents fetching anything
    //}

    //let filter = `$filter=RouteUUID eq guid'${uuid}'`;
    //alert("Generated Filter: " + filter);
  //  return filter;
//}
    //const appCD = context.getAppClientData();
  const appCD = context.getAppClientData();
    if (appCD.RouteFilter) {
        //alert(" Using stored filter: " + appCD.RouteFilter);
        return appCD.RouteFilter;
    } else {
        //alert("No RouteFilter found, returning default");
        return "$filter=1 eq 0"; // prevent fetch
    }
}
