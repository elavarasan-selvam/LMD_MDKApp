/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function IsStartButtonVisibleForReturn(context) {

       try {
        // Show Start button only if TruckInfoConfirmed is false
        let isConfirmed = context.getAppClientData().TruckReturnConfirmed;
        return !isConfirmed;  // true = visible, false = hidden
    } catch (e) {
        context.getLogger().error("IsStartButtonVisibleForReturn error: " + e);
        return true;  // safe fallback: show button
    }
}
