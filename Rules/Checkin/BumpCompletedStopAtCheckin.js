export default function BumpCompletedStopAtCheckin(context) {
    const appCD = context.getAppClientData();
    appCD.KPICompletedStops = (appCD.KPICompletedStops || 0) + 1;

    // Execute both actions sequentially
    context.executeAction('/LMD_MDKApp/Actions/Main/Routes/EndDateTime.action');
    context.executeAction('/LMD_MDKApp/Actions/Main/Stops/EndDateTime.action');
    return context.executeAction('/LMD_MDKApp/Actions/StartCheckin/UpdateOdometerChangeSet.action');
}
