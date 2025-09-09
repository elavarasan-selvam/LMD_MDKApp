export default function GetTruckInfoDescription(context) {
    let isConfirmed = context.getAppClientData().TruckInfoConfirmed;

    if (isConfirmed === true) {
        return "";  // done → empty description
    }
    return "Record the mileage of your truck.";  // open → show description
}
