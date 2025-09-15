export default function IsStartButtonVisibleforTruckInfoofCheckin(context) {
    try {
        // Show Start button only if CheckinTruckInfoConfirmed is false
        let isConfirmed = context.getAppClientData().CheckinTruckInfoConfirmed;
        return !isConfirmed;  // true = visible, false = hidden
    } catch (e) {
        context.getLogger().error("IsStartButtonVisibleforTruckInfoofCheckin error: " + e);
        return true;  // safe fallback: show button
    }
}
