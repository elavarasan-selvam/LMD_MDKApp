export default function BuildDeliveredQtyToast(clientAPI) {

    const deliveredQty = clientAPI.binding?.DeliveredQuantity || 0;

    return `Delivered quantity updated to ${deliveredQty}`;
}
