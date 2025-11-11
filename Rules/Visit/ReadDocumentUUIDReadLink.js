export default async function ReadDocumentUUIDReadLink(context) {
    try {
        // Step 1: Get the result from the already executed ReadDocumentUUID action
        const readResult = context.getActionResult('ReadDocumentUUID');
        //const readResult = await context.executeAction('/LMD_MDKApp/Actions/MyVisit/ReadDocumentUUID.action');

        alert(`Raw ReadDocumentUUID result:\n${JSON.stringify(readResult, null, 2)}`);
        const documentsArray = readResult?.data?._array;

        if (!documentsArray || documentsArray.length === 0) {
            alert('No documents found from ReadDocumentUUID action.');
            return;
        }

        alert(`Found ${documentsArray.length} documents:\n${JSON.stringify(documentsArray, null, 2)}`);

        // Step 2: Loop through each document and update DeliveryDate
        const currentDate = new Date().toISOString().split('.')[0];

        for (let i = 0; i < documentsArray.length; i++) {
            const doc = documentsArray[i];
            const docReadLink = doc['@odata.readLink'];
            
            if (!docReadLink) {
                alert(`Document ${doc.DocumentUUID || doc.DocumentID} has empty ReadLink.`);
                continue;
            }
            const documentID = doc.DocumentID;
            alert('DocumentID:'+documentID);
            alert(`Updating DeliveryDate for Document ReadLink:\n${JSON.stringify(docReadLink, null, 2)}`);

            await context.executeAction({
                Name:'/LMD_MDKApp/Actions/MyVisit/UpdateDeliveryDate.action',
                Properties: {
                    Target: { ReadLink: docReadLink },
                    Properties: { DeliveryDate: currentDate ,
                        DocumentID: documentID}
                }
            });

            alert(` DeliveryDate updated for DocumentUUID: ${doc.DocumentUUID || 'unknown'}`);
        }

    } catch (err) {
        alert('Error in UpdateDocumentDeliveryDate: ' + err.message);
    }
}


