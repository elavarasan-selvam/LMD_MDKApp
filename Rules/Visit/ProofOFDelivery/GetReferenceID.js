/**
 * Get DocumentID from Documents entity based on current Stop
 * @param {IClientAPI} clientAPI
 */
export default async function GetReferenceID(clientAPI) {
    try {
        const appCD = clientAPI.getAppClientData();
        const stopRef = appCD.currentStop || clientAPI.getPageProxy().binding;

        if (!stopRef || !stopRef.StopUUID) {
         //   alert(' Stop binding or StopUUID missing');
            return '';
        }

        const stopUUID = stopRef.StopUUID;
      //  alert(` Current StopUUID: ${stopUUID}`);

        const service = '/LMD_MDKApp/Services/LMD_MA.service';

        // Read Documents for this StopUUID
        const documentsResult = await clientAPI.read(
            service,
            'Documents',
            [],
            `$filter=StopUUID eq guid'${stopUUID}'`
        );

        if (documentsResult && documentsResult.length > 0) {
            const document = documentsResult.getItem(0);
            const documentID = document.DocumentID;

         //   alert(` Fetched DocumentID: ${documentID}`);
            return documentID;
        }

    //    alert(' No Document found for this Stop');
        return '';

    } catch (err) {
     //   alert(' Error in GetReferenceID ' + err.message);
        return '';
    }
}
