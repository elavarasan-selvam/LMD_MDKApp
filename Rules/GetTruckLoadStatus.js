export default function GetTruckLoadStatus(context) {
    // read client data flag
    let isConfirmed = context.getPageProxy().getClientData().TruckLoadConfirmed;
    return isConfirmed ? "Done" : "Open";   // default "Open", changes to "Done"
}
