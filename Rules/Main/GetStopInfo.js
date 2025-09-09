// GetStopInfo.js
export default function GetStopInfo(context) {
    let stop = context.binding;   // Current Stop record

    if (!stop) {
        return '';
    }

    let stopType = stop.StopType;
    let routeUUID = stop.RouteUUID;

    // CASE 1: VISIT -> return RouteUUID directly
    if (stopType === 'VISIT') {
        return routeUUID || '';
    }

    // CASE 2: CHECKIN / CHECKOUT -> fetch VehicleID
    if ((stopType === 'CHECKIN' || stopType === 'CHECKOUT') && routeUUID) {
        return context.read(
            '/LMD_MDKApp/Services/DEST_SAMLMD_PPROP.service',
            'Routes',
            ['VehicleID'],
            `$filter=RouteUUID eq guid'${routeUUID}'`
        ).then(result => {
            if (result && result.length > 0) {
                let vehicleId = result.getItem(0).VehicleID;
                return vehicleId  ? `My Truck: ${vehicleId}` : '';
            }
            return '';
        }).catch(() => {
            return '';
        });
    }

    return '';
}
