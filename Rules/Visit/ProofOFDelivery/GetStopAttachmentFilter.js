// /LMD_MDKApp/Rules/GetStopAttachmentFilter.js
export default async function GetStopAttachmentFilter(context) {
    const appCD = context.getAppClientData();
    const binding = context.getPageProxy().binding;

    const stopUUID =
        appCD.currentStop?.StopUUID ||
        binding?.StopUUID;

    if (!stopUUID) {
        return "$filter=1 eq 0";
    }

    const service = '/LMD_MDKApp/Services/LMD_MA.service';

    /* 1️⃣ Read Document for this Stop */
    const documents = await context.read(
        service,
        'Documents',
        [],
        `$filter=StopUUID eq guid'${stopUUID}'`
    );

    if (!documents || documents.length === 0) {
        return "$filter=1 eq 0";
    }

    const documentID = documents.getItem(0).DocumentID;

    /* 2️⃣ Store DocumentID if needed */
    appCD.currentDocumentID = documentID;

    /* 3️⃣ Return Attachment filter */
    return `$filter=ReferenceID eq '${documentID}'`;
}
