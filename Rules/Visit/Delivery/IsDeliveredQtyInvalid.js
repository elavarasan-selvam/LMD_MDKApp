export default function IsDeliveredQtyInvalid(context) {
    const binding = context.getPageProxy().binding;
    const entered = Number(binding.DeliveredQuantity || 0);
    const maxQty  = Number(binding.OrderedQuantity || 0);
    return entered > maxQty;
}
