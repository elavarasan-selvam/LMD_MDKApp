export default async function GetAttachments(clientAPI) {

    alert("Function started");

    const binding = clientAPI.getPageProxy().binding;
    if (!binding || !binding.RouteUUID) {
        alert(" No binding or RouteUUID found");
        return false;
    }

    const routeUUID = binding.RouteUUID;
    alert(" RouteUUID: " + routeUUID);

    try {
        // STEP 1: Get VISIT stop
        alert(" Reading VISIT stop...");

        const stopResult = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'VISIT'`
        );

        if (!stopResult || stopResult.length === 0) {
            alert(" No VISIT stop found");
            return false;
        }

        const stopUUID = stopResult.getItem(0).StopUUID;
        alert(" VISIT StopUUID: " + stopUUID);

        // STEP 2: Get Document for VISIT stop
        alert(" Reading Document for StopUUID...");

        const documentResult = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Documents',
            [],
            `$filter=StopUUID eq guid'${stopUUID}'`
        );

        if (!documentResult || documentResult.length === 0) {
            alert(" No Document found for this Stop");
            return false;
        }

        const documentID = documentResult.getItem(0).DocumentID;
        alert(" DocumentID: " + documentID);

        // STEP 3: Read Attachments using ReferenceID (= DocumentID)
        alert(" Reading Attachments using ReferenceID...");

        const attachmentResult = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Attachments',
            [],
            `$filter=ReferenceID eq '${ReferenceID}' and AttachmentKind eq 'DL'`
        );

        alert(" Attachments found: " + (attachmentResult ? attachmentResult.length : 0));

        return attachmentResult && attachmentResult.length > 0;

    } catch (e) {
        alert(" Error occurred: " + e.message);
        return false;
    }
}
