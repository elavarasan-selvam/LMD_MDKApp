export default function GetCheckinTruckLoadDescription(context) {
    let isConfirmed = context.getAppClientData().CheckinTruckLoadConfirmed;

    if (isConfirmed === true) {
        return "";  // done → empty description
    }
    return "Confirm the number of loaded items.";  // open → show description
}
