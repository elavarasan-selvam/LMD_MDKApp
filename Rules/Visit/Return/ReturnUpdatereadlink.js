/**
 * @param {IClientAPI} context
 */
export default async function ReturnUpdatereadlink(context) {

    const service = "/LMD_MDKApp/Services/LMD_MA.service";

    const appCD = context.getAppClientData();

    // --------------------------------------------------
    // Get current binding
    // --------------------------------------------------

    const binding =
        context.getPageProxy().binding ||
        context.binding;

    if (!binding) {
        return "";
    }


    // --------------------------------------------------
    // Get StopUUID
    // --------------------------------------------------

    const currentStop =
        appCD.currentStop ||
        binding;

    const stopUUID = currentStop.StopUUID;

    if (!stopUUID) {
        return "";
    }


    // --------------------------------------------------
    // Get ProductID from current DocumentItem
    // --------------------------------------------------

    const productID = binding.ProductID;

    if (!productID) {
        return "";
    }


    // --------------------------------------------------
    // Read DocumentItems
    // Find exact item using:
    // StopUUID + ProductID
    // --------------------------------------------------

    const result = await context.read(
        service,
        "DocumentItems",
        [],
        `$filter=StopUUID eq guid'${stopUUID}' and ProductID eq '${productID}'`
    );


    // --------------------------------------------------
    // Return exact DocumentItem ReadLink
    // --------------------------------------------------

    if (result && result.length > 0) {

        return result.getItem(0)["@odata.readLink"];
    }

    return "";
}