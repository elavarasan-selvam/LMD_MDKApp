/* GetStopIcon.js */
export default function GetStopIcon(context) {
    let stop = context.binding;
    if (!stop) return '';

    const stopType = stop.StopType;

    switch (stopType) {
        case 'CHECKIN':
            return 'sap-icon://inbox';

        case 'CHECKOUT':
            return 'sap-icon://outbox';

        case 'VISIT':
            return 'sap-icon://visits';

        case 'DEPOSIT':
            return 'sap-icon://money-bills';

       case 'RELOAD_CI':
            return 'sap-icon://inbox';

        case 'RELOAD_CO':
            return 'sap-icon://outbox';

        default:
            return 'sap-icon://map'; // fallback icon
    }
}
