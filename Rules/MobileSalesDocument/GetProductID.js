export default async function GetProductID(context) {

    const result = await context.read(
        "/LMD_MDKApp/Services/API_PRODUCT_SRV.service",
        "A_Product",
        [],
       "$filter=Division eq '01'"
    );

    const pickerItems = [];

    result.forEach(item => {
        pickerItems.push({
            ReturnValue: item.Product,
            DisplayValue: item.Product
        });
    });

    return pickerItems;
}