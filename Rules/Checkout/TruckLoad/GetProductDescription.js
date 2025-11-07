export default function GetProductDescription(context) {
    try {
        const productId = context.binding.ProductID;
 
        if (!productId) {
            return "No Product ID";
        }
 
        // Check if already cached in client data
        const clientData = context.getAppClientData();
        clientData.ProductDescriptions = clientData.ProductDescriptions || {};
        if (clientData.ProductDescriptions[productId]) {
            return clientData.ProductDescriptions[productId];
        }
 
        // Return a placeholder first (so UI doesn’t stay blank)
        const placeholder = "Loading...";
 
        // Async read
        context.read(
            '/LMD_MDKApp/Services/API_PRODUCT_SRV.service',
            'A_ProductDescription',
            [],
            `$filter=Product eq '${productId}'`
        ).then(result => {
            if (result && result.length > 0) {
                let desc = result.getItem(0).ProductDescription;
                clientData.ProductDescriptions[productId] = desc;
 
                // Force redraw of section
                const pageProxy = context.getPageProxy();
                const section = pageProxy.getControl('SectionObjectCollection3');
                if (section) {
                    section.redraw();
                }
            }
        });
 
        return placeholder; // temporary display
    } catch (err) {
        return "Error fetching description";
    }
}
 