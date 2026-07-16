/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default async function DocumentReadLink(clientAPI) {
    const documentID = clientAPI.getAppClientData().CurrentDocumentID;
    //alert(documentID);
    let readlink = await clientAPI.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'Documents',
        [],
        `$filter=DocumentID eq '${documentID}'`
    );
    if (readlink && readlink.length > 0) {
        const documentUUID = readlink.getItem(0).DocumentUUID;
        //alert(documentUUID);
        return `Documents(guid'${documentUUID}')`;
    }
    return '';
}
