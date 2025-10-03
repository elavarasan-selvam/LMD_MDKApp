export default function GetReturnItemsText(context) {
    let binding = context.binding;
    let service = "/LMD_MDKApp/Services/DEST_SAMSMA_PPROP.service";

    return context.read(
        service,
        "DocumentItems",
        [],
        `$filter=DocumentUUID eq guid'${binding.DocumentUUID}'`
    ).then(result => {
        if (result && result.length > 0) {
            let totalReturn = 0;
            for (let i = 0; i < result.length; i++) {
                let item = result.getItem(i);
                let ordered = item.OrderedQuantity || 0;
                let delivered = item.DeliveredQuantity || 0;
                if (ordered > delivered) {
                    totalReturn += (ordered - delivered);
                }
            }
            return `Items: ${totalReturn}`;
        } else {
            return "Items: 0";
        }
    });
}
