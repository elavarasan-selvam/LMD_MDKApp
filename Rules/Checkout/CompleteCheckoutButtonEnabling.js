/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function CompleteCheckoutButtonEnabling(context) {
    try {
        // CompleteCheckoutButton is enabled only if CompleteCheckoutButton is True
        //let isConfirmed = context.getAppClientData().CompleteCheckoutButton;
        //return isConfirmed;  // true = Enabled, false = hidden
        let c = context.getAppClientData();

        // Enabled only if BOTH TruckLoadConfirmed and TruckInfoConfirmed are true
        let isTruckLoadConfirmed = c.TruckLoadConfirmed === true;
        let isTruckInfoConfirmed = c.TruckInfoConfirmed === true;

        return isTruckLoadConfirmed && isTruckInfoConfirmed;  
    } catch (e) {
        context.getLogger().error("IsStartButtonVisible error: " + e);
        return false;  // safe fallback: Don't show button
    }
}
