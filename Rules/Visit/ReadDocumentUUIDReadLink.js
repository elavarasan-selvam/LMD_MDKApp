export default async function ReadDocumentUUIDReadLink(context) {
    try {
        const appCD = context.getAppClientData();
        const currentStopUUID = appCD.currentStop?.StopUUID;
        if (!currentStopUUID) {
            //alert("No current StopUUID found. Skipping document update.");
            return;
        }

        // Step 1: Get the result from the already executed ReadDocumentUUID action
        const readResult = context.getActionResult('ReadDocumentUUID');
        const documentsArray = readResult?.data?._array;

        if (!documentsArray || documentsArray.length === 0) {
            //alert('No documents found from ReadDocumentUUID action.');
            return;
        }

        // Step 2: Filter only documents for the current StopUUID
        const stopDocs = documentsArray.filter(doc => doc.StopUUID === currentStopUUID);

        if (stopDocs.length === 0) {
            //alert("No DocumentItems found for the current stop.");
            return;
        }

        //alert(`Found ${stopDocs.length} documents for current StopUUID: ${currentStopUUID}`);

        const currentDate = new Date().toISOString().split('.')[0];

        // Step 3: Loop through each filtered document and update DeliveryDate
        for (let doc of stopDocs) {
            const docReadLink = doc['@odata.readLink'];
            if (!docReadLink) {
                //alert(`Document ${doc.DocumentUUID || doc.DocumentID} has empty ReadLink.`);
                continue;
            }

            await context.executeAction({
                Name: '/LMD_MDKApp/Actions/MyVisit/UpdateDeliveryDate.action',
                Properties: {
                    Target: { ReadLink: docReadLink },
                    Properties: { DeliveryDate: currentDate, DocumentID: doc.DocumentID }
                }
            });

            //alert(`DeliveryDate updated for DocumentUUID: ${doc.DocumentUUID || 'unknown'}`);
        }

    } catch (err) {
        alert('Error in ReadDocumentUUIDReadLink: ' + err.message);
    }
}
