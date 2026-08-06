export default async function GetOrderedUOM(context) {

    try {

        const pageProxy = context.getPageProxy();

        // Get ProductID ListPicker control
        const productPickerControl =
            pageProxy.getControl("FormCellContainer")
                .getControl("FormCellListPicker0");

        // Selected ProductID
        const selectedValues =
            productPickerControl.getValue();

        if (!selectedValues || selectedValues.length === 0) {
            return "";
        }

        const productID =
            selectedValues[0].ReturnValue;

        // Current Stop details
        const appCD = context.getAppClientData();

        const currentStop =
            appCD.currentStop ||
            pageProxy.binding ||
            context.binding;

        if (
            !currentStop?.StopUUID ||
            !currentStop?.RouteUUID
        ) {
            return "";
        }

        const stopUUID = currentStop.StopUUID;
        const routeUUID = currentStop.RouteUUID;

        // Read matching DocumentItem
        const result = await context.read(
            "/LMD_MDKApp/Services/LMD_MA.service",
            "DocumentItems",
            [],
            `$filter=ProductID eq '${productID}'
            and StopUUID eq guid'${stopUUID}'
            and RouteUUID eq guid'${routeUUID}'
            and IsReturn eq false`
        );

        if (!result || result.length === 0) {
            return "";
        }

        // Return OrderedUOM
        return result.getItem(0).OrderedUOM || "";

    } catch (e) {

        context.getLogger().error(
            "GetOrderedUOM Error: " + String(e)
        );

        alert(
            "ERROR: " + String(e)
        );

        return "";
    }
}