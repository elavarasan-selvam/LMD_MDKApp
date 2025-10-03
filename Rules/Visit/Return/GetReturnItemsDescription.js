export default function GetReturnDescription(context) {
    let isConfirmed = context.getAppClientData().TruckReturnConfirmed;

    if (isConfirmed === true) {
        return "";  // once confirmed, nothing to show
    }

    let binding = context.binding;
    let service = "/LMD_MDKApp/Services/DEST_SAMSMA_PPROP.service";

    return context.read(
        service,
        "DocumentItems",
        [],
        `$filter=DocumentUUID eq guid'${binding.DocumentUUID}' and OrderedQuantity gt DeliveredQuantity`
    ).then(result => {
        if (result && result.length > 0) {
            // Collect ProductIDs (or both ProductID + Description)
            let items = [];
            for (let i = 0; i < result.length; i++) {
                let item = result.getItem(i);
                let returnQty = (item.OrderedQuantity || 0) - (item.DeliveredQuantity || 0);
                items.push(`${item.ProductID} (${returnQty} ${item.OrderedUOM})`);
            }
            // Join into a single string
            return "Returns: " + items.join(", ");
        } else {
            return "No planned returns to collect.";
        }
    });
}
