export default function InitializeTruckLoadandTruckInfoFlag(context) {
    const appCD = context.getAppClientData();

    if (appCD.TruckLoadConfirmed === undefined) appCD.TruckLoadConfirmed = false;
    if (appCD.TruckInfoConfirmed === undefined) appCD.TruckInfoConfirmed = false;

    // Store Checkout Stop reference separately
    if (!appCD.currentStop && context.binding) {
        appCD.currentStop = context.binding; // store Stop entity
        appCD.currentRouteUUID = context.binding.RouteUUID;
        console.log('Checkout Stop reference stored: ' + context.binding.StopID);
    }
    //alert('Checkout StopID: ' + context.binding.StopID + '\nStopUUID: ' + context.binding.StopUUID + 'StopType:'+context.binding.StopType);

    return true;
}