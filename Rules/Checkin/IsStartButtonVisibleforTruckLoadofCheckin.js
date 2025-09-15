export default function IsStartButtonVisibleforTruckLoadofCheckin(context) {
    try {
        // Show Start button only if CheckinTruckLoadConfirmed is false
        let isConfirmed = context.getAppClientData().CheckinTruckLoadConfirmed;
        return !isConfirmed;  // true = visible, false = hidden
    } catch (e) {
        context.getLogger().error("IsStartButtonVisibleforTruckLoadofCheckin error: " + e);
        return true;  // safe fallback: show button
    }
}
