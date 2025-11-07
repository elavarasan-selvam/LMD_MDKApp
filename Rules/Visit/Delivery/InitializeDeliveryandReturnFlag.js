export default function InitializeDeliveryandReturnFlag(context) {
    const appCD = context.getAppClientData();

    if (appCD.TruckDeliveryConfirmed === undefined) appCD.TruckDeliveryConfirmed = false;
    if (appCD.TruckReturnConfirmed === undefined) appCD.TruckReturnConfirmed = false;

    // Store Visit Stop reference separately
    if (context.binding) {
    appCD.currentStop = context.binding;
    //alert('Visit Stop reference updated: ' + context.binding.StopID);
    }
    //alert('Visit StopID: ' + context.binding.StopID + 
    //  '\nStopUUID: ' + context.binding.StopUUID);


    return true;
}