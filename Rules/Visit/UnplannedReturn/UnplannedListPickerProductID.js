/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default async function GetProductPickerValues(context) {
 
    const appCD = context.getAppClientData();
 
    const currentStop =

        appCD.currentStop ||

        context.getPageProxy().binding ||

        context.binding;
 
    if (!currentStop?.StopUUID || !currentStop?.RouteUUID) {

        return [];

    }
 
    const shiptoId = currentStop.ShipToID; 
    try {
 
        const documents = await context.read(

            "/LMD_MDKApp/Services/LMD_MA.service",

            "Documents",

            [],

            `$filter=ShipToPartyID eq '${shiptoId}'`

        );
        if (!documents || documents.length === 0) {

            return [];

        }
 
        const pickerItems = [];
 
        for (let i = 0; i < documents.length; i++) {
 
            const doc = documents.getItem(i);
 
            const documentID = doc.DocumentID;
 
            if (!documentID) {

                continue;

            }
            const documentItems = await context.read(

                "/LMD_MDKApp/Services/LMD_MA.service",

                "DocumentItems",

                [],

                `$filter=DocumentID eq '${documentID}'`

            );
 
            if (!documentItems || documentItems.length === 0) {

                continue;

            }
 
            for (let j = 0; j < documentItems.length; j++) {
 
                const item = documentItems.getItem(j);
 
                if (

                    item.ProductID &&

                    !pickerItems.some(

                        p => p.ReturnValue === item.ProductID

                    )

                ) {
 
                    pickerItems.push({

                        ReturnValue: item.ProductID,

                        DisplayValue: item.ProductID,

                        DocumentID: documentID

                    });

                }

            }

        }
        return pickerItems;
 
    } catch (e) {
 
        alert("ERROR: " + e);
 
        context.getLogger().error(

            "GetProductPickerValues Error: " + e

        );
 
        return [];

    }

}
 