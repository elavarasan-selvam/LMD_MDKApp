export default function IsStartButtonVisibleForDelivery(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    return !(stopUUID && appCD.DeliveryConfirmedByStop?.[stopUUID]);
}
