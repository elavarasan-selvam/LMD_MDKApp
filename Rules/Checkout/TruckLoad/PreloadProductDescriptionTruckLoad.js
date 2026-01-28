import GetTruckLoadFilter from
    '/LMD_MDKApp/Rules/Checkout/TruckLoad/GetTruckLoadFilter';

export default async function PreloadProductDescriptionTruckLoad(context) {
    try {
        const pageProxy = context.getPageProxy();
        const appCD = context.getAppClientData();

        appCD.TruckLoadDescriptions =
            appCD.TruckLoadDescriptions || {};

        const filter = await GetTruckLoadFilter(context);
        if (!filter || filter === "$filter=1 eq 0") return;

        const items = await context.read(
            "/LMD_MDKApp/Services/LMD_MA.service",
            "DocumentItems",
            [],
            filter
        );

        const reads = [];

        for (let i = 0; i < items.length; i++) {
            const pid = items.getItem(i).ProductID;

            if (pid && !appCD.TruckLoadDescriptions[pid]) {
                reads.push(
                    context.read(
                        "/LMD_MDKApp/Services/API_PRODUCT_SRV.service",
                        "A_ProductDescription",
                        [],
                        `$filter=Product eq '${pid}' and Language eq 'EN'`
                    ).then(r => {
                        if (r.length > 0) {
                            appCD.TruckLoadDescriptions[pid] =
                                r.getItem(0).ProductDescription;
                        }
                    })
                );
            }
        }

        await Promise.all(reads);

        const section =
            pageProxy.getControl("SectionedTable0")
                ?.getSection("SectionObjectCollection4");

        section?.redraw();

    } catch (e) {
        context.getLogger().error(
            "PreloadProductDescriptionTruckLoad: " + e
        );
    }
}
