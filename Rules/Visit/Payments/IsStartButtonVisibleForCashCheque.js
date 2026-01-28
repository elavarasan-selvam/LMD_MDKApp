export default function IsStartButtonVisibleForCashCheque(context) {
   const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    return !(stopUUID && appCD.CollectionPaymentConfirmed?.[stopUUID]);
}



