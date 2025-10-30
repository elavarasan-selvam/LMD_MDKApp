export default async function BumpCompletedStops(context) {
    const appCD = context.getAppClientData();

    // Increment KPI counter
    appCD.KPICompletedStops = (appCD.KPICompletedStops || 0) + 1;

    // Get Stop reference from current binding or AppClientData
    const stop = context.binding || appCD.currentStop;
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

    // 3Update Stop EndDateTime
    await context.executeAction({
        Name: '/LMD_MDKApp/Actions/Main/Stops/EndDateTime.action',
        Properties: {
            Target: { ReadLink: stopReadLink },
            Properties: { EndDateTime: currentDate }
        }
    });

    // Optionally, you can continue with any next actions here
    return context.executeAction("/LMD_MDKApp/Actions/StartCheckout/CompleteCheckout.action");
}
