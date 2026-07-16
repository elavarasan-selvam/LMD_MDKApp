export default async function StopsDateTimeUpdate_OnTransfer(context) {
    const routeUUID = context.getAppClientData().EarliestRouteUUID;

    if (!routeUUID) {
        return;
    }

    const stops = await context.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'Stops',
        [],
        `$filter=RouteUUID eq guid'${routeUUID}'`
    );

    if (stops && stops.length > 0) {
        for (let i = 0; i < stops.length; i++) {
            const stop = stops.getItem(i);

            context.getAppClientData().CurrentStopUUID = stop.StopUUID;

            await context.executeAction(
                '/LMD_MDKApp/Actions/TruckTransfer/UpdateStopDateTime.action'
            );
        }
    }

    await context.executeAction(
        '/LMD_MDKApp/Actions/TruckTransfer/UpdateRouteEndDateTime.action'
    );
}