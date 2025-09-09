export default function IsStartButtonVisibleforTruckLoad(context) {
    try {
        // Show Start button only if TruckLoadConfirmed is false
        let isConfirmed = context.getAppClientData().TruckLoadConfirmed;
        return !isConfirmed;  // true = visible, false = hidden
    } catch (e) {
        context.getLogger().error("IsStartButtonVisibleforTruckLoad error: " + e);
        return true;  // safe fallback: show button
    }
}
