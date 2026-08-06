import GetPlannedMobileSales from
'/LMD_MDKApp/Rules/MobileSalesDocument/GetPlannedMobileSales';

export default async function MobileSalesPreloadDescription(context) {

    try {

        const appCD = context.getAppClientData();

        if (!appCD.MobileSalesDescriptions) {
            appCD.MobileSalesDescriptions = {};
        }

        const filter = await GetPlannedMobileSales(context);

        if (!filter || filter === "$filter=1 eq 0") {
            return;
        }

        const items = await context.read(
            "/LMD_MDKApp/Services/LMD_MA.service",
            "MobileSalesDocumentItems",
            [],
            filter
        );

        if (!items || items.length === 0) {
            return;
        }

        const reads = [];

        for (let i = 0; i < items.length; i++) {

            const productID = items.getItem(i).ProductID;

            if (!productID) {
                continue;
            }

            if (appCD.MobileSalesDescriptions[productID]) {
                continue;
            }

            reads.push(

                context.read(
                    "/LMD_MDKApp/Services/API_PRODUCT_SRV.service",
                    "A_ProductDescription",
                    [],
                    `$filter=Product eq '${productID}' and Language eq 'EN'`
                ).then(result => {

                    if (result.length > 0) {

                        appCD.MobileSalesDescriptions[productID] =
                            result.getItem(0).ProductDescription;

                    }

                })

            );

        }

        await Promise.all(reads);

    } catch (e) {

        context.getLogger().error(
            "MobileSalesPreloadDescription: " + e
        );

    }

}