export default function GetReturnItemsText(context) {
    let binding = context.binding;
    let service = "/LMD_MDKApp/Services/DEST_SAMLMD_PPROP.service";
 
    // Adjust field names according to your entity set
    return context.read(
        service,
        "DocumentItems",
        [],
        `$filter=DocumentUUID eq guid'${binding.DocumentUUID}' and DeliveredQuantity lt OrderedQuantity`
    ).then(result => {
        if (result && result.length > 0) {
            return `Items: ${result.length}`;
        } else {
            return "Items: 0";
        }
    });
}