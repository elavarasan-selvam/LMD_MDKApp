/**
 * @param {IClientAPI} context
 */
export default function GetOrderedQuantity(context) {
 
    const pageProxy = context.getPageProxy();
 
    const sectionedTable = pageProxy.getControl('SectionedTable0');
 
    const quantityControl = sectionedTable.getControl('FCOrderedQuantity');
 //   alert(`Ordered Quantity: ${quantityControl.getValue()}`);  
    return quantityControl.getValue();
}