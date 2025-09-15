export default function InitializeCheckinTruckLoadandTruckInfoFlag(context) {
    if (context.getAppClientData().CheckinTruckLoadConfirmed === undefined) {
        context.getAppClientData().CheckinTruckLoadConfirmed = false;
    }
    if (context.getAppClientData().CheckinTruckInfoConfirmed === undefined) {
        context.getAppClientData().CheckinTruckInfoConfirmed = false;
    }
    //if (context.getAppClientData().CompleteCheckoutButton === undefined) {
       // context.getAppClientData().CompleteCheckoutButton = false;
    //}
    return true;
}
