export default function GetCheckinTruckLoadStatus(context) {
    try {
        // Read the confirmation flag
        let isConfirmed = context.getAppClientData().CheckinTruckLoadConfirmed;
        if (isConfirmed === true) {
            return "Done";   // only after confirmation
        }
        return "Open";       // default before confirmation
    } catch (e) {
        context.getLogger().error("GetCheckinTruckInfoStatus error: " + e);
        return "Open";       // fallback
    }
}
