/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function OnWillUpdate(clientAPI) {
    return clientAPI.executeAction('/LMD_MDKApp/Actions/Application/OnWillUpdate.action').then((result) => {
        if (result.data) {
            let close_API_LASTMILERELOADREQUEST = clientAPI.executeAction('/LMD_MDKApp/Actions/API_LASTMILERELOADREQUEST/Service/CloseOffline.action');
            let close_API_LASTMILEVISITLIST = clientAPI.executeAction('/LMD_MDKApp/Actions/API_LASTMILEVISITLIST/Service/CloseOffline.action');
            let close_DEST_SAMLMD_PPROP = clientAPI.executeAction('/LMD_MDKApp/Actions/DEST_SAMLMD_PPROP/Service/CloseOffline.action');
            return Promise.all([close_API_LASTMILERELOADREQUEST, close_API_LASTMILEVISITLIST, close_DEST_SAMLMD_PPROP]).then(() => {
                Promise.resolve();
            }).catch((err) => {
                Promise.reject('Offline Odata Close Failed ' + err.message);
            });
        } else {
            return Promise.reject('User Deferred');
        }
    });
}