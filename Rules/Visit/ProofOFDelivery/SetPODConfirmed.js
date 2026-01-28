export default function SetPODConfirmed(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    if (!stopUUID) {
        return Promise.resolve();
    }

    if (!appCD.PODConfirmedByStop) {
        appCD.PODConfirmedByStop = {};
    }

    // ✅ Mark POD as Done
    appCD.PODConfirmedByStop[stopUUID] = true;

    // ✅ Navigate back to Visit page
    return context.executeAction(
        '/LMD_MDKApp/Actions/ClosePage.action'
    );
}
