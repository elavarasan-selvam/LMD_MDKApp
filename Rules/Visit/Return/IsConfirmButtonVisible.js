export default function IsConfirmButtonVisible(context) {
    let binding = context.binding;
    let service = "/LMD_MDKApp/Services/DEST_SAMSMA_PPROP.service";

    return context.read(
        service,
        "DocumentItems",
        [],
        `$apply=filter(DocumentUUID eq guid'${binding.DocumentUUID}' and OrderedQuantity gt DeliveredQuantity)/aggregate($count as Count)`
    ).then(result => {
        if (result && result.length > 0) {
            let count = result.getItem(0).Count;
            return count === 0; // true only if no return items
        }
        return true;
    });
}
