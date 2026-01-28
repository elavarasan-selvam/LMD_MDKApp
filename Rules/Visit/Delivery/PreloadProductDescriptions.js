import GetPlannedDelivery from '/LMD_MDKApp/Rules/Visit/Delivery/GetPlannedDelivery';

export default async function PreloadProductDescriptions(context) {
    try {
        const pageProxy = context.getPageProxy();
        const appCD = context.getAppClientData();
        appCD.ProductDescriptions = appCD.ProductDescriptions || {};

        const filter = await GetPlannedDelivery(context);
        if (!filter || filter === "$filter=1 eq 0") {
            return;
        }

        const items = await context.read(
            "/LMD_MDKApp/Services/LMD_MA.service",
            "DocumentItems",
            [],
            filter
        );

        const reads = [];

        for (let i = 0; i < items.length; i++) {
            const pid = items.getItem(i).ProductID;
            if (pid && !appCD.ProductDescriptions[pid]) {
                reads.push(
                    context.read(
                        "/LMD_MDKApp/Services/API_PRODUCT_SRV.service",
                        "A_ProductDescription",
                        [],
                        `$filter=Product eq '${pid}' and Language eq 'EN'`
                    ).then(r => {
                        if (r.length > 0) {
                            appCD.ProductDescriptions[pid] =
                                r.getItem(0).ProductDescription;
                        }
                    })
                );
            }
        }

        await Promise.all(reads);

        // Redraw ObjectCollection section
        const table = pageProxy.getControl("SectionedTable0");
        if (!table) return;

        const section = table.getSection("SectionObjectCollection3");
        if (!section) return;

        section.redraw();

    } catch (e) {
        // silent fail (no popup in production)
        context.getLogger().error("PreloadProductDescriptions: " + e);
    }
}
