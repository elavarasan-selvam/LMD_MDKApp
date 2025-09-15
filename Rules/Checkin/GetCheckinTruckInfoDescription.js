export default function GetCheckinTruckInfoDescription(context) {
    let isConfirmed = context.getAppClientData().CheckinTruckInfoConfirmed;

    if (isConfirmed === true) {
        return "";  // done → empty description
    }
    return "Record the odometer reading of your truck.";  // open → show description
}
