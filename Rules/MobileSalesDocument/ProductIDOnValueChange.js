export default async function ProductIDOnValueChange(context) {

    try {

        const value = context.getValue();

        if (!value || value.length === 0) {
            return;
        }

        const productID = value[0].ReturnValue;

     //   alert("Selected Product: " + productID);

        const result = await context.read(
            "/LMD_MDKApp/Services/API_PRODUCT_SRV.service",
            "A_ProductUnitsOfMeasure",
            [],
            `$filter=Product eq '${productID}'`
        );

       // alert("Records Found: " + result.length);

        if (!result || result.length === 0) {
            return;
        }

        const orderedUOM = result.getItem(0).BaseUnit;

     //   alert("Ordered UOM: " + orderedUOM);

        const pageProxy = context.getPageProxy();

        const uomControl = pageProxy.evaluateTargetPath(
            "#Control:FormCellSimpleProperty5"
        );

        if (uomControl) {
            uomControl.setValue(orderedUOM);
        }

    } catch (error) {

     //   alert(
     //       "Error: " +
       //     (error.message
        //        ? error.message
          //      : JSON.stringify(error))
      //  );

    }
}