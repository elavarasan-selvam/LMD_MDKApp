export default function GetProductDescriptionsTruckLoad(context) {
    const appCD = context.getAppClientData();
    const productId = context.binding?.ProductID;

    if (!productId) return "";

    appCD.TruckLoadDescriptions =
        appCD.TruckLoadDescriptions || {};

    if (!appCD._truckPrefetchStarted) {
        appCD._truckPrefetchStarted = true;
        context.executeAction(
            "/LMD_MDKApp/Rules/Checkout/TruckLoad/PreloadProductDescriptionTruckLoad.js"
        );
    }

    return appCD.TruckLoadDescriptions[productId] || "";
}
