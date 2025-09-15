export default function GetDeliveryDescription(context) {
    let isConfirmed = context.getAppClientData().TruckDeliveryConfirmed;

    if (isConfirmed === true) {
        return "";  // done → empty description
    }
    return "Check and confirm the delivery of ordered goods.";  // open → show description
}
