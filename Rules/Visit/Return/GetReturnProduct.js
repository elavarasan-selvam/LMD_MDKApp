export default function GetReturnProduct(context) {
    let binding = context.binding;

    let routeUUID = binding.RouteUUID;   // dynamically read the route ID

    let query = `$filter=IsReturn eq true and RouteUUID eq guid'${routeUUID}'&$orderby=RouteUUID desc`;

    return context.read(
        "/LMD_MDKApp/Services/LMD_MA.service",
        "DocumentItems",
        [],
        query
    );
}
