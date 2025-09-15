export default function GetReturnDescription(context) {
    let isConfirmed = context.getAppClientData().TruckReturnConfirmed;

    if (isConfirmed === true) {
        return "";  // done → empty description
    }
    return "No planned returns to collect.";  // open → show description
}
