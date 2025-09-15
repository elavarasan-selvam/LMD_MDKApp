/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function CompleteCheckinButtonEnabling(context) {
    try {
        // CompleteCheckinButton is enabled only if CompleteCheckinButton is True
        //let isConfirmed = context.getAppClientData().CompleteCheckoutButton;
        //return isConfirmed;  // true = Enabled, false = hidden
        let c = context.getAppClientData();

        // Enabled only if BOTH TruckLoadConfirmed and TruckInfoConfirmed are true
        let isCheckinTruckLoadConfirmed = c.CheckinTruckLoadConfirmed === true;
        let isCheckinTruckInfoConfirmed = c.CheckinTruckInfoConfirmed === true;

        return isCheckinTruckLoadConfirmed && isCheckinTruckInfoConfirmed;  
    } catch (e) {
        context.getLogger().error("CompleteCheckinButtonEnabling error: " + e);
        return false;  // safe fallback: Don't show button
    }
}
