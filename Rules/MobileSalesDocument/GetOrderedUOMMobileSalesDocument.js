export default async function GetOrderedUOMMobileSalesDocument(context) {

    // Get selected ProductID from the Product picker
    const productValue = context.evaluateTargetPath(
        "#Control:MobileSalesProductID/#Value"
    );

    if (!productValue || productValue.length === 0) {
        return "";
    }

    const productID = productValue[0].ReturnValue;

    const result = await context.read(
        "/LMD_MDKApp/Services/API_PRODUCT_SRV.service",
        "A_ProductUnitsOfMeasure",
        [],
        `$filter=Product eq '${productID}'&$top=1`
    );

    if (result && result.length > 0) {
        return result.getItem(0).BaseUnit;
    }

    return "";
}