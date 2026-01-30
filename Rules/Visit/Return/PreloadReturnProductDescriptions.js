import GetPlannedReturn from '/LMD_MDKApp/Rules/Visit/Return/GetPlannedReturn';

export default async function PreloadReturnProductDescriptions(context) {
    try {
        const pageProxy = context.getPageProxy();
        const appCD = context.getAppClientData();

        appCD.ReturnDescriptions = appCD.ReturnDescriptions || {};

        const filter = await GetPlannedReturn(context);
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
            if (pid && !appCD.ReturnDescriptions[pid]) {
                reads.push(
                    context.read(
                        "/LMD_MDKApp/Services/API_PRODUCT_SRV.service",
                        "A_ProductDescription",
                        [],
                        `$filter=Product eq '${pid}' and Language eq 'EN'`
                    ).then(r => {
                        if (r.length > 0) {
                            appCD.ReturnDescriptions[pid] =
                                r.getItem(0).ProductDescription;
                        }
                    })
                );
            }
        }

        await Promise.all(reads);

        const table = pageProxy.getControl("SectionedTable0");
        const section = table?.getSection("SectionObjectCollection0");
        section?.redraw();

    } catch (e) {
        context.getLogger().error("PreloadReturnProductDescriptions: " + e);
    }
}
