/**
* Capture selected ProductID and DocumentID
* @param {IClientAPI} context
*/
 
export default async function CaptureDocumentID(context) {
 
    try {
 
       
        const selectedValue = context.getValue();
 
        if (!selectedValue || selectedValue.length === 0) {
            return;
        }
 
        const selectedItem = selectedValue[0];
 
        const productID = selectedItem.ReturnValue;
        const documentID = selectedItem.DocumentID;
 
      
        const pageCD = context.getPageProxy().getClientData();
 
        pageCD.ProductID = productID;
        pageCD.DocumentID = documentID;
 
    } catch (e) {
 
        context.getLogger().error(
            "CaptureDocumentID Error: " + e
        );
    }
}