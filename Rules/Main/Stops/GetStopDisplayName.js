export default async function GetStopDisplayName(context) {

    const stop = context.binding;
    if (!stop) return '';

    let stopType = stop.StopType;
    if (!stopType) return '';

    // Normalize string to lowercase first
    stopType = stopType.toLowerCase();

    // Capitalize first letter
    stopType = stopType.charAt(0).toUpperCase() + stopType.slice(1);

    if (stopType === 'Checkout') return 'Start Checkout';
    if (stopType === 'Checkin') return 'Start Checkin';
    if (stopType === 'Visit') return 'Start Visit';

    return '';
}
