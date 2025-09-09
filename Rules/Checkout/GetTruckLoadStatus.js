export default function GetTruckLoadStatus(context) {
    try {
        // Read the confirmation flag
        let isConfirmed = context.getAppClientData().TruckLoadConfirmed;
        if (isConfirmed === true) {
            return "Done";   // only after confirmation
        }
        return "Open";       // default before confirmation
    } catch (e) {
        context.getLogger().error("GetTruckInfoStatus error: " + e);
        return "Open";       // fallback
    }
}
