export default function DeliveredQtyErrorMessage(context) {
    const binding = context.getPageProxy().binding;
    const maxQty = binding.OrderedQuantity || 0;

    return `Delivery quantity cannot exceed ${maxQty}`;
}
