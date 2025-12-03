export default function GetPlannedReturn(context) {
  const appCD = context.getAppClientData();

  if (appCD.RouteFilter) {
      alert("Using stored filter: " + appCD.RouteFilter);
      alert("return route"+ `${appCD.RouteFilter} and IsReturn eq true`);
      return `${appCD.RouteFilter} and IsReturn eq true`;
  } else {
      alert("No RouteFilter found, returning default");
      return "$filter=1 eq 0";  // prevent fetch
  }
}
