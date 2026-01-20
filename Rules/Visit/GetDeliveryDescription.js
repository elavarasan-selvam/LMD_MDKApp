/*

export default function GetDeliveryDescription(context) {
    let isConfirmed = context.getAppClientData().DeliveryConfirmedByStop;

    if (isConfirmed === true) {
        return "";  // done → empty description
    }
    return "Check and confirm the delivery of ordered goods.";  // open → show description
}
*/

export default function GetDeliveryDescription(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    // If POD is completed → hide description
    if (stopUUID && appCD.DeliveryConfirmedByStop?.[stopUUID] === true) {
        return "";
    }

    // If POD is open → show description
    return "Check and confirm the delivery of ordered goods. ";
}
