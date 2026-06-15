/**
 * Describe this function...
/**
 * @param {IClientAPI} context

export default async function GetDeliveryDate(context) {

    try {

        // Get stored DocumentID
        const documentID =
            context.getPageProxy().getClientData().DocumentID;

        if (!documentID) {
            return "";
        }

        // Read Documents entity
        const result = await context.read(
            "/LMD_MDKApp/Services/LMD_MA.service",
            "Documents",
            [],
            `$filter=DocumentID eq '${documentID}'`
        );

        if (result && result.length > 0) {

            const item = result.getItem(0);

            const deliveryDate = item.DeliveryDate;

            // Store locally
            context.getPageProxy().getClientData().DeliveryDate =
                deliveryDate;
            return deliveryDate;
        }

        return "";

    } catch (e) {
        context.getLogger().error(e);

        return "";
    }
}*/

export default function GetLastChangeTimeStamp(context) {
    let now = new Date();
    let isoString = now.toISOString().split('.')[0];  
    return isoString;
}
 
