export default function GetProductDescription(context) {
    const appCD = context.getAppClientData();
    const productId = context.binding?.ProductID;

    if (!productId) return "";

    appCD.ProductDescriptions = appCD.ProductDescriptions || {};

    // trigger preload once
    if (!appCD._prefetchStarted) {
        appCD._prefetchStarted = true;
        context.executeAction(
            "/LMD_MDKApp/Rules/Visit/Delivery/PreloadProductDescriptions.js"
        );
    }

    return appCD.ProductDescriptions[productId] || "";
}
