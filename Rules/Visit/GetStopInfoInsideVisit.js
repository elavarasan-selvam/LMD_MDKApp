/* GetStopInfo.js */
export default function GetStopInfo(context) {
    let stop = context.binding;
    if (!stop) return '';

    const stopType = stop.StopType;

    // Only handle VISIT stops
    if (stopType === 'VISIT') {
        // 1) Use navigation property if available
        if (stop.to_Address && Array.isArray(stop.to_Address) && stop.to_Address.length > 0) {
            const addr = stop.to_Address[0];
            const city = addr.City || '';
            const postal = addr.PostalCode || '';
            const country = addr.Country || '';
            return `${city} ${postal} ${country}`.trim();
        }

        // 2) Otherwise, read from Addresses entity
        const addressKey = stop.AddressID;
        if (!addressKey) return '';

        const service = '/LMD_MDKApp/Services/DEST_SAMLMD_PPROP.service';
        const entity = 'Addresses';
        const filter = `$filter=AddressNumber eq '${addressKey}'`;

        return context.read(service, entity, [], filter).then(result => {
            if (result && result.length > 0) {
                const address = result.getItem(0);
                const city = address.City || '';
                const postal = address.PostalCode || '';
                const country = address.Country || '';
                return `${city} ${postal} ${country}`.trim();
            }
            return '';
        }).catch(() => {
            return '';
        });
    }

    // For all other stop types, return nothing
    return '';
}
