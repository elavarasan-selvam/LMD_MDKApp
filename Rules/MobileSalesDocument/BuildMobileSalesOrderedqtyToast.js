export default function BuildMobileSalesOrderedqtyToast(clientAPI) {

    const orderedQty = clientAPI.binding?.OrderedQuantity || 0;

    return `Ordered quantity updated`;
}