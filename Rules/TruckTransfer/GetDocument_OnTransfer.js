/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default async function GetDocument_OnTransfer(context) {
    const stopUUID = context.getAppClientData().CurrentStopUUID;
    const documents = await context.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'Documents',
        [],
        `$filter=StopUUID eq guid'${stopUUID}'`
    );
    if (documents && documents.length > 0) {
        for (const document of documents) {
            context.getAppClientData().CurrentDocumentID = document.DocumentID;
            //alert(document.DocumentID);
            await context.executeAction(
                '/LMD_MDKApp/Actions/TruckTransfer/DocumentUpdate_OnTransfer.action'
            );
        }
    }
}
