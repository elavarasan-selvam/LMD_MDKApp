export default async function GetPlant(context) {

    const productID = context
        .getPageProxy()
        .evaluateTargetPath("#Control:MobileSalesProductID")
        .getValue()[0].ReturnValue;

    if (!productID) {
        return "";
    }

    const result = await context.read(
        "/LMD_MDKApp/Services/API_PRODUCT_SRV.service",
        "A_ProductPlant",
        [],
        `$filter=Product eq '${productID}'&$top=1`
    );

    if (!result || result.length === 0) {
        return "";
    }

    return result.getItem(0).Plant;
}