/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function ConfirmCheckinPaymentandnavigation(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    if (stopUUID) {

        if (!appCD.CheckinCOCIPaymentConfirmedByStop) {
            appCD.CheckinCOCIPaymentConfirmedByStop = {};
        }

        appCD.CheckinCOCIPaymentConfirmedByStop[stopUUID] = true;
    }
    return context.executeAction('/LMD_MDKApp/Actions/CloseModalPage_Complete.action');
    
}
