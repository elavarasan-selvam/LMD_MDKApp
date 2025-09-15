/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function ConfirmVisitDeliveryAndNavigate(context) {
     context.getAppClientData().TruckDeliveryConfirmed = true;
    
    // Navigate back to Visit
    return context.executeAction('/LMD_MDKApp/Actions/NavBackToMyVisitFromConfirmDelivered.action');
}

