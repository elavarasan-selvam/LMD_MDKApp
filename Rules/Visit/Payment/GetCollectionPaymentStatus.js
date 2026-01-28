export default function GetCollectionPaymentStatus(context) {
  const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    if (stopUUID && appCD.CollectionPaymentConfirmed?.[stopUUID]) {
        return "Done";
    }
    return "Open";
}
