/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default async function UnplannedReturnCaptureDocItemCreationOrderedOUM(context) {
 
const ProdID = context.getPageProxy().getClientData().ProductID;
const service = '/LMD_MDKApp/Services/API_PRODUCT_SRV.service';
const list = await context.read(
            service,
            'A_ProductUnitsOfMeasure',
            [],
            `$filter=Product eq '${ProdID}'`
        );
if (!list || list.length === 0) {
            return '';
        }
const Ordereduom = list.getItem(0).BaseUnit;
// alert("OrderedUOM" + Ordereduom);  
return Ordereduom;  
}
