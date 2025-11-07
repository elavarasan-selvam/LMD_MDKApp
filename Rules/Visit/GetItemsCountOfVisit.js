export default function GetItemsCountOfVisit(context) {
    let binding = context.binding;
    let service = "/LMD_MDKApp/Services/DEST_SAMSMA_PPROP.service";

    let query = `$apply=filter(RouteUUID eq guid'${binding.RouteUUID}')/aggregate(ProductID with countdistinct as ProductCount)`;

    return context.read(service, "DocumentItems", [], query)
    .then(result => {
        if (result && result.length > 0) {
            let count = result.getItem(0).ProductCount || 0;
            return `Items: ${count}`;
        } else {
            return "Items: 0";
        }
    });
}
