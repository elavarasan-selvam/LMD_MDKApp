export default async function BumpCompletedStopAtCheckin(context) {
    const appCD = context.getAppClientData();
    appCD.KPICompletedStops = (appCD.KPICompletedStops || 0) + 1;

    const stop = appCD.currentStop;
    const routeUUID = appCD.currentRouteUUID;

    if (!stop) {
        alert('Stop reference missing! Cannot update EndDateTime.');
        return;
    }

    const stopReadLink = stop['@odata.readLink'];
    if (!stopReadLink) {
        alert('Stop readLink missing! Keys: ' + Object.keys(stop).join(', '));
        return;
    }

    const currentDate = new Date().toISOString().split('.')[0];
    alert('Updating Stop EndDateTime for: ' + stop.StopID + ' to ' + currentDate);

    // Update Route EndDateTime (if routeUUID exists)
    if (routeUUID) {
        const routeReadLink = `Routes(guid'${routeUUID}')`;
        await context.executeAction({
            Name: '/LMD_MDKApp/Actions/Main/Routes/EndDateTime.action',
            Properties: {
                Target: { ReadLink: routeReadLink },
                Properties: { EndDateTime: currentDate }
            }
        });
        alert('Route EndDateTime updated: ' + routeReadLink);
    }

    // Update Stop EndDateTime
    await context.executeAction({
        Name: '/LMD_MDKApp/Actions/Main/Stops/EndDateTime.action',
        Properties: {
            Target: { ReadLink: stopReadLink },
            Properties: { EndDateTime: currentDate }
        }
    });
    alert('Stop EndDateTime updated: ' + stop.StopID);

    // Execute Odometer changeset
    return context.executeAction('/LMD_MDKApp/Actions/StartCheckin/UpdateOdometerChangeSet.action');
}
