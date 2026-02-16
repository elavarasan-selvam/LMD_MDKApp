/* GetStopIcon.js */
export default function GetStopIcon(context) {
    let stop = context.binding;
    if (!stop) return '';

    const stopType = stop.StopType;

    switch (stopType) {
        case 'CHECKIN':
            return 'sap-icon://factory';

        case 'CHECKOUT':
            return 'sap-icon://factory';

        case 'VISIT':
            return 'sap-icon://customer';

        default:
            return 'sap-icon://map'; // fallback icon
    }
}
