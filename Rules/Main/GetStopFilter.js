export default function GetStopFilter(context) {
    const appCD = context.getAppClientData();

    if (appCD.RouteFilter) {
        //alert("Using stored filter: " + appCD.RouteFilter);
        let StopFilter = appCD.RouteFilter + "&$orderby=Sequence asc";
        //alert("Generated Stop Filter: " + StopFilter);
        return StopFilter;
    } else {
        //alert("No RouteFilter found, returning default");
        return "$filter=1 eq 0"; // prevent fetch
    }
}
