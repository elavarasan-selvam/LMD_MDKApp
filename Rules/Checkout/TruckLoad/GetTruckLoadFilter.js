export default function GetTruckLoadFilter(context) {
    const binding = context.binding;

    if (!binding || !binding.RouteUUID) {
        return "$filter=1 eq 0";
    }

    return "$filter=IsReturn eq false and RouteUUID eq guid'" +
        binding.RouteUUID + "'";
}
