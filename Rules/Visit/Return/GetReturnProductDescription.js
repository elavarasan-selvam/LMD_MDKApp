export default function GetReturnProductDescription(context) {
    const appCD = context.getAppClientData();
    const productId = context.binding?.ProductID;

    if (!productId) return "";

    appCD.ReturnDescriptions =
        appCD.ReturnDescriptions || {};

    if (!appCD._returnPrefetchStarted) {
        appCD._returnPrefetchStarted = true;
        context.executeAction(
            "/LMD_MDKApp/Rules/Visit/Return/PreloadReturnProductDescriptions.js"
        );
    }

    // hide until ready
    if (!appCD._returnReady) {
        return "Loading";
    }

    return appCD.ReturnDescriptions[productId] || "";
}
