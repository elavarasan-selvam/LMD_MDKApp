export default function IsStartButtonVisibleForDelivery(context) {
    try {
        // Show Start button only if TruckDeliveredConfirmed is false
        let isConfirmed = context.getAppClientData().TruckDeliveryConfirmed;
        return !isConfirmed;  // true = visible, false = hidden
    } catch (e) {
        context.getLogger().error("IsStartButtonVisibleForDelivery error: " + e);
        return true;  // safe fallback: show button
    }
}
