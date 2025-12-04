export default async function BumpCompletedStopAtCheckin(context) {
    const appCD = context.getAppClientData();
    appCD.KPICompletedStops = (appCD.KPICompletedStops || 0) + 1;
 
    // Use currentStop from CheckIn page binding
    const stop = appCD.currentStop || context.binding;
    const routeUUID = appCD.currentRouteUUID || (context.binding ? context.binding.RouteUUID : null);
 
    if (!stop || !stop.StopUUID) {
        alert('Stop reference missing or StopUUID undefined!');
        return;
    }
 
    const stopUUID = stop.StopUUID;
    //alert('Reloading Stop for UUID: ' + stopUUID);
 
    // Read Stop freshly to get readLink
    const readResult = await context.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'Stops',
        [],
        `$filter=StopUUID eq guid'${stopUUID}'`
    );
 
    if (!readResult || readResult.length === 0) {
        alert('Stop not found for UUID: ' + stopUUID);
        return;
    }
 
    // Support different MDK readResult formats
    let stopEntity;
    if (typeof readResult.getItem === 'function') {
        stopEntity = readResult.getItem(0);
    } else if (Array.isArray(readResult)) {
        stopEntity = readResult[0];
    } else if (readResult.data && Array.isArray(readResult.data)) {
        stopEntity = readResult.data[0];
    } else {
        stopEntity = readResult;
    }
 
    const stopReadLink = stopEntity['@odata.readLink'] || `Stops(guid'${stopUUID}')`;
    const currentDate = new Date().toISOString().split('.')[0];
    const stopID = stopEntity.StopID || 'Unknown Stop';
 
    //alert('Updating Stop EndDateTime for: ' + stopID + ' to ' + currentDate);
 
    // Update Route EndDateTime first (if routeUUID exists)
    if (routeUUID) {
        const routeReadLink = `Routes(guid'${routeUUID}')`;
        await context.executeAction({
            Name: '/LMD_MDKApp/Actions/Main/Routes/EndDateTime.action',
            Properties: {
                Target: { ReadLink: routeReadLink },
                Properties: { EndDateTime: currentDate }
            }
        });
        //alert('Route EndDateTime updated: ' + routeReadLink);
    }
 
    // Update Stop EndDateTime 
    await context.executeAction({
        Name: '/LMD_MDKApp/Actions/Main/Stops/EndDateTime.action',
        Properties: {
            Target: { ReadLink: stopReadLink },
            Properties: { EndDateTime: currentDate }
        }
    });
    //alert('Stop EndDateTime updated: ' + stopID);
 
    // Execute Odometer changeset
    //return context.executeAction('/LMD_MDKApp/Actions/StartCheckin/UpdateOdometerChangeSet.action');
    return context.executeAction("/LMD_MDKApp/Actions/StartCheckin/NavToMainPagefromCompleteCheckin.action");
}
