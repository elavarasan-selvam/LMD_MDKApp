/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
// /LMD_MDKApp/Rules/GetProductDescription.js
export default function ReGetProductDescription(context) {
    let productId = context.binding.ProductID;
    if (!productId) return "No Product";

    return context.read(
        '/LMD_MDKApp/Services/API_PRODUCT_SRV.service',
        'A_ProductDescription',
        [],
        `$filter=Product eq '${productId}' and Language eq 'EN'&$top=1`
    ).then(result => {
        if (result && result.length > 0) {
            return result.getItem(0).ProductDescription;
        } else {
            return "Description not found";
        }
    });
}
