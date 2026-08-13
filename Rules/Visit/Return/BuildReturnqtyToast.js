export default function BuildReturnqtyToast(clientAPI) {

    const pageProxy = clientAPI.getPageProxy();

    const quantityControl = pageProxy.evaluateTargetPath(
        "#Control:FCReturnQuantity"
    );

    if (!quantityControl) {
        return "Return quantity updated";
    }

    const deliveredQty = quantityControl.getValue();

    return `Return quantity updated to ${deliveredQty}`;
}