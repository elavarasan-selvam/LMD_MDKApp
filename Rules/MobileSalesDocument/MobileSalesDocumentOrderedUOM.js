export default async function UnplannedReturnCaptureDocItemCreationOrderedOUM(context) {

    const ProdID = context.getPageProxy().getClientData().ProductID;

    alert("ProductID = " + ProdID);

    if (!ProdID) {
        return "";
    }

    const list = await context.read(
        '/LMD_MDKApp/Services/API_PRODUCT_SRV.service',
        'A_ProductUnitsOfMeasure',
        [],
        `$filter=Product eq '${ProdID}'`
    );

    alert("Records = " + list.length);

    if (!list || list.length === 0) {
        return "";
    }

    const orderedUOM = list.getItem(0).BaseUnit;

    alert("UOM = " + orderedUOM);

    return orderedUOM;
}