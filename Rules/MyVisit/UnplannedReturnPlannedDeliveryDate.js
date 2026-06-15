/**
 * Describe this function...
 /**
 * @param {IClientAPI} context
 */

export default async function GetPlannedDeliveryDate(context) {

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

            const plannedDeliveryDate = item.PlannedDeliveryDate;

            // Store locally
            context.getPageProxy().getClientData().PlannedDeliveryDate =
                plannedDeliveryDate;
            return plannedDeliveryDate;
        }

        return "";

    } catch (e) {
        context.getLogger().error(e);

        return "";
    }
}
