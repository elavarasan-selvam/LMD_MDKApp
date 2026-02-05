export default function ConfirmVisitReturn(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    if (!appCD.ReturnConfirmedByStop) {
        appCD.ReturnConfirmedByStop = {};
    }

    if (stopUUID) {
        appCD.ReturnConfirmedByStop[stopUUID] = true;
    }

    return context.executeAction(
        '/LMD_MDKApp/Actions/MyVisit/ShowVisitReturnToast.action'
    ).then(() => {
        //  Force redraw of current page
        context.getPageProxy().redraw();
        return true;
    });
}
