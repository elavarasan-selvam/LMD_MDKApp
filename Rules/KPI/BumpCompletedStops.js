export default async function BumpCompletedStops(context) {

    const appCD = context.getAppClientData();
    const stopRef = appCD.currentStop || context.binding;

    if (!stopRef || !stopRef.StopUUID) {
        alert("Stop reference missing");
        return;
    }

    const stopUUID = stopRef.StopUUID;
    const stopID = stopRef.StopID;

    //  Safety check (must match button rule)
    if (
        appCD.DeliveryConfirmedByStop?.[stopUUID] !== true ||
        appCD.ReturnConfirmedByStop?.[stopUUID] !== true
    ) {
        await context.executeAction({
            Name: "/LMD_MDKApp/Actions/Message.action",
            Properties: {
                Title: "Pending Actions",
                Message:
                    "Please complete both Delivery and Return before completing the visit.",
                OKCaption: "OK"
            }
        });
        return;
    }

    // KPI update
    appCD.KPICompletedStops =
        (appCD.KPICompletedStops || 0) + 1;

    const readResult = await context.read(
        "/LMD_MDKApp/Services/LMD_MA.service",
        "Stops",
        [],
        `$filter=StopUUID eq guid'${stopUUID}'`
    );

    if (!readResult || readResult.length === 0) {
        alert("Stop not found");
        return;
    }

    const stop = readResult.getItem(0);
    const stopReadLink = stop["@odata.readLink"];
    const currentDate = new Date().toISOString().split(".")[0];

    await context.executeAction({
        Name: "/LMD_MDKApp/Actions/Main/Stops/EndDateTime.action",
        Properties: {
            Target: { ReadLink: stopReadLink },
            Properties: { EndDateTime: currentDate }
        }
    });

    await context.executeAction(
        "/LMD_MDKApp/Actions/MyVisit/ReadDocumentUUID.action"
    );

    return context.executeAction(
        "/LMD_MDKApp/Actions/StartMyVisit/CompleteVisit.action"
    );
}
