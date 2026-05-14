export default async function GetStopDisplayName(context) {

    const stop = context.binding;
    if (!stop) return '';

    let stopType = stop.StopType;
    if (!stopType) return '';

    // Make comparison safe
    stopType = stopType.toUpperCase();

    // ---------------- CHECKOUT ----------------
    if (stopType === 'CHECKOUT') {
        return 'Checkout';
    }

    // ---------------- CHECKIN ----------------
    if (stopType === 'CHECKIN') {
        return 'Checkin';
    }

    // ---------------- VISIT ----------------
    if (stopType === 'VISIT' && stop.RouteUUID) {

        const service = '/LMD_MDKApp/Services/LMD_MA.service';
        const entity = 'Stops';

        const filter = `$filter=RouteUUID eq guid'${stop.RouteUUID}' and StopType eq '${stop.StopType}'&$orderby=Sequence asc`;

        try {

            const result = await context.read(service, entity, [], filter);
            const totalVisits = result.length;

            // If only 1 visit → just "Visit"
            if (totalVisits <= 1) {
                return 'Visit';
            }

            let visitIndex = 0;

            for (let i = 0; i < result.length; i++) {
                const item = result.getItem(i);

                if (item.StopUUID === stop.StopUUID) {
                    visitIndex = i + 1;
                    break;
                }
            }

            return 'Visit-' + visitIndex;

        } catch (error) {
            return 'Visit';
        }
    }
        // ---------------- DEPOSIT ----------------
    if (stopType === 'DEPOSIT' && stop.RouteUUID) {

        const service = '/LMD_MDKApp/Services/LMD_MA.service';

        const filter =
        `$filter=RouteUUID eq guid'${stop.RouteUUID}' and StopType eq 'DEPOSIT'&$orderby=Sequence asc`;

        try {

            const result = await context.read(
                service,
                'Stops',
                [],
                filter
            );

            if (result.length <= 1) {
                return 'BankDeposit';
            }

            let depositIndex = 0;

            for (let i = 0; i < result.length; i++) {

                const item = result.getItem(i);

                if (
                    item['@odata.readLink'] ===
                    stop['@odata.readLink']
                ) {

                    depositIndex = i + 1;

                    break;
                }
            }

            return 'BankDeposit-' + depositIndex;

        } catch (e) {

            return 'BankDeposit';
        }
    }
    return '';
}
