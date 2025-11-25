/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function OnWillUpdate(clientAPI) {
    return clientAPI.executeAction('/LMD_MDKApp/Actions/Application/OnWillUpdate.action').then((result) => {
        if (result.data) {
            //let close_DEST_SAMLMD_PPROP = clientAPI.executeAction('/LMD_MDKApp/Actions/DEST_SAMLMD_PPROP/Service/CloseOffline.action');
            let close_MD_BUSINESSPARTNER_SRV = clientAPI.executeAction('/LMD_MDKApp/Actions/MD_BUSINESSPARTNER_SRV/Service/CloseOffline.action');
            let close_API_PRODUCT_SRV = clientAPI.executeAction('/LMD_MDKApp/Actions/API_PRODUCT_SRV/Service/CloseOffline.action');
            let close_LMD_MA = clientAPI.executeAction('/LMD_MDKApp/Actions/LMD_MA/Service/CloseOffline.action');
            return Promise.all([close_LMD_MA,close_API_PRODUCT_SRV,close_MD_BUSINESSPARTNER_SRV]).then(() => {
                Promise.resolve();
            }).catch((err) => {
                Promise.reject('Offline Odata Close Failed ' + err.message);
            });
        } else {
            return Promise.reject('User Deferred');
        }
    });
}