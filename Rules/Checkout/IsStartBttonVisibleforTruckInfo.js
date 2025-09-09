export default function IsStartButtonVisibleforTruckInfo(context) {
    try {
        // Show Start button only if TruckInfoConfirmed is false
        let isConfirmed = context.getAppClientData().TruckInfoConfirmed;
        return !isConfirmed;  // true = visible, false = hidden
    } catch (e) {
        context.getLogger().error("IsStartButtonVisibleforTruckInfo error: " + e);
        return true;  // safe fallback: show button
    }
}
