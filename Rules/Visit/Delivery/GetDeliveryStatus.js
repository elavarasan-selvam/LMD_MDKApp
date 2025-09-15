export default function GetDeliveryStatus(context) {
    try {
        // Read the confirmation flag
        let isConfirmed = context.getAppClientData().TruckDeliveryConfirmed;
        if (isConfirmed === true) {
            return "Done";   // only after confirmation
        }
        return "Open";       // default before confirmation
    } catch (e) {
        context.getLogger().error("GetReturnStatus error: " + e);
        return "Open";       // fallback
    }
}
