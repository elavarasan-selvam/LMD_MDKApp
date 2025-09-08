export default function InitializeTruckLoadFlag(context) {
    if (context.getAppClientData().TruckLoadConfirmed === undefined) {
        context.getAppClientData().TruckLoadConfirmed = false;
    }
    return true;
}
