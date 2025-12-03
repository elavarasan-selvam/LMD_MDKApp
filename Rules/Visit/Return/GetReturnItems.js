export default function GetReturnItems(context) {
    let binding = context.binding;
    let service = "/LMD_MDKApp/Services/LMD_MA.service";

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
