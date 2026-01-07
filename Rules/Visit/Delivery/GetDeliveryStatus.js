export default function GetDeliveryStatus(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    if (stopUUID && appCD.DeliveryConfirmedByStop?.[stopUUID]) {
        return "Done";
    }
    return "Open";
}
