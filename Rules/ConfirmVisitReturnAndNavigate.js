/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function ConfirmVisitReturnAndNavigate(context) {
        context.getAppClientData().TruckReturnConfirmed = true;
    
    // Navigate back to Visit
    return context.executeAction('/LMD_MDKApp/Actions/NavBackToMyVisitFromConfirmReturn.action');

}
