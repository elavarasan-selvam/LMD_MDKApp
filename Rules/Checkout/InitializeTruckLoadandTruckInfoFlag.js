export default function InitializeTruckLoadandTruckInfoFlag(context) {
    if (context.getAppClientData().TruckLoadConfirmed === undefined) {
        context.getAppClientData().TruckLoadConfirmed = false;
    }
    if (context.getAppClientData().TruckInfoConfirmed === undefined) {
        context.getAppClientData().TruckInfoConfirmed = false;
    }
    //if (context.getAppClientData().CompleteCheckoutButton === undefined) {
       // context.getAppClientData().CompleteCheckoutButton = false;
    //}
    return true;
}
