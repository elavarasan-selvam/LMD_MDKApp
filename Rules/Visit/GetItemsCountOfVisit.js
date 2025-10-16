export default function GetItemsCountOfVisit(context) {
    let binding = context.binding;
    let service = "/LMD_MDKApp/Services/DEST_SAMLMD_PPROP.service";

    return context.read(
        service,
        "DocumentItems",
        [],
        `$apply=filter(DocumentUUID eq guid'${binding.DocumentUUID}')/aggregate(DocumentItemUUID with countdistinct as ItemCount)`
    ).then(result => {
        if (result && result.length > 0) {
            let count = result.getItem(0).ItemCount;
            return `Items: ${count}`;
        } else {
            return "Items: 0";
        }
    });
}
