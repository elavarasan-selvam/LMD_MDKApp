/**
 * Describe this function...
/**
 * @param {IClientAPI} context
 */

export default async function GetIsReturn(context) {

    try {

        // Get stored DocumentID
        const documentID =
            context.getPageProxy().getClientData().DocumentID;

        if (!documentID) {
            return false;
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

            const isReturn = item.IsReturn;

            // Store in ClientData for reuse
            context.getPageProxy().getClientData().IsReturn = isReturn;
            return isReturn;
        }

        return false;

    } catch (e) {
        context.getLogger().error(e);

        return false;
    }
}
