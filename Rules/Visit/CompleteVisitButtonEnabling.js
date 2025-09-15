/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function CompleteVisitButtonEnabling(context) {
    try {
        // CompleteVisitButton is enabled only if CompleteVisitButton is True
        //let isConfirmed = context.getAppClientData().CompleteVisitButton;
        //return isConfirmed;  // true = Enabled, false = hidden
        let c = context.getAppClientData();

        // Enabled only if BOTH TruckDeliveryConfirmed and TruckReturnConfirmed are true
        let isTruckDeliveryConfirmed = c.TruckDeliveryConfirmed === true;
        let isTruckReturnConfirmed = c.TruckReturnConfirmed === true;

        return isTruckDeliveryConfirmed && isTruckReturnConfirmed;  
    } catch (e) {
        context.getLogger().error("IsStartButtonVisible error: " + e);
        return false;  // safe fallback: Don't show button
    }
}
