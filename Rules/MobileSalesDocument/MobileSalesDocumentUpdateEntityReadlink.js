/**
 * @param {IClientAPI} context
 */
export default async function MobileSalesDocumentUpdateEntityReadlink(context) {

    const service = "/LMD_MDKApp/Services/LMD_MA.service";

    const appCD = context.getAppClientData();

    // Get current binding
    const binding =
        context.getPageProxy().binding ||
        context.binding;

    if (!binding) {
        return "";
    }

    // Get current Stop
    const currentStop =
        appCD.currentStop ||
        binding;

    const stopUUID = currentStop.StopUUID;

    if (!stopUUID) {
        return "";
    }

    // Get ProductID of the item being edited
    const productID = binding.ProductID;

    if (!productID) {
        return "";
    }

    // Read the exact MobileSalesDocumentItem
    const result = await context.read(
        service,
        "MobileSalesDocumentItems",
        [],
        `$filter=StopUUID eq guid'${stopUUID}' and ProductID eq '${productID}'`
    );

    if (result && result.length > 0) {

        return result.getItem(0)["@odata.readLink"];
    }

    return "";
}