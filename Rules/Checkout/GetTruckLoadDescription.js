export default function GetTruckLoadDescription(context) {
    let isConfirmed = context.getAppClientData().TruckLoadConfirmed;

    if (isConfirmed === true) {
        return "";  // done → empty description
    }
    return "Check and confirm your truck load.";  // open → show description
}
