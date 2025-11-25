/**
 * Create COCI Products from PendingProductList
 * @param {IClientAPI} clientAPI
 */
export default function CreateCOCIProducts(clientAPI) {
    return clientAPI.executeAction('/LMD_MDKApp/Actions/StartCheckin/COCIProduct_Create_from_Stops.action');
}
