export default function BuildReturnqtyToast(clientAPI) {

    const deliveredQty = clientAPI.binding?.DeliveredQuantity || 0;

    return `Return quantity updated to ${deliveredQty}`;
}
