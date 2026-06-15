/**
 * Describe this function...
/**
 * @param {IClientAPI} context
 */

export default async function GetCustomerReferenceNumber(context) {

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
            `$filter=DocumentID eq ${documentID}`
        );

        if (result && result.length > 0) {

            const item = result.getItem(0);

            const customerReferenceNumber = item.CustomerReferenceNumber;

            // Store in ClientData for reuse
            context.getPageProxy().getClientData().CustomerReferenceNumber =
                customerReferenceNumber;
            return customerReferenceNumber;
        }

        return "";

    } catch (e) {
        context.getLogger().error(e);

        return "";
    }
}
