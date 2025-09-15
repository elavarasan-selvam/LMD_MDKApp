export default function InitializeDeliveryandReturnFlag(context) {
    if (context.getAppClientData().TruckDeliveryConfirmed === undefined) {
        context.getAppClientData().TruckDeliveryConfirmed = false;
    }
    if (context.getAppClientData().TruckReturnConfirmed === undefined) {
        context.getAppClientData().TruckReturnConfirmed = false;
    }
    //if (context.getAppClientData().CompleteCheckoutButton === undefined) {
       // context.getAppClientData().CompleteCheckoutButton = false;
    //}
    return true;
}
