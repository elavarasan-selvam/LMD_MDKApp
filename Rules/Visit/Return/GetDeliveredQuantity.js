/**
 * @param {IClientAPI} context
 */
export default function GetDeliveredQuantity(context) {

    const pageProxy = context.getPageProxy();

    const sectionedTable = pageProxy.getControl("SectionedTable0");

    const quantityControl = sectionedTable.getControl("FCReturnQuantity");
 //      alert(`Delivered Quantity: ${quantityControl.getValue()}`);  
    return quantityControl.getValue();
}