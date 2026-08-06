export default function SetMobileSalesDocumentConfirmed(context) {

    const appCD = context.getAppClientData();

    const stopUUID =
        (appCD.currentStop || context.binding)?.StopUUID;

    if (!stopUUID) {
        return Promise.resolve();
    }

    if (!appCD.MobileSalesDocumentByStop) {
        appCD.MobileSalesDocumentByStop = {};
    }

    // Mark this stop as completed
    appCD.MobileSalesDocumentByStop[stopUUID] = true;

    return context.executeAction(
        '/LMD_MDKApp/Actions/StartMyVisit/MobileSalesDocument/ShowMobileSalesDocumentToast.action'
    )
    .then(() => {

        // Close MobileSalesPage and return to Visit page
        return context.executeAction(
            '/LMD_MDKApp/Actions/ClosePage.action'
        );

    })
    .then(() => {

        // Refresh Visit page so the card updates
        const page = context.getPageProxy();
        if (page) {
            page.redraw();
        }

        return Promise.resolve();
    });
}