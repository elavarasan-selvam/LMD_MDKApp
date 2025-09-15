export default function GetReturnStatus(context) {
    try {
        // Read the confirmation flag
        let isConfirmed = context.getAppClientData().TruckReturnConfirmed;
        if (isConfirmed === true) {
            return "Done";   // only after confirmation
        }
        return "Open";       // default before confirmation
    } catch (e) {
        context.getLogger().error("GetReturnStatus error: " + e);
        return "Open";       // fallback
    }
}