export default function GetStopAttachmentReadLink(clientAPI) {
    try {
        const appCD = clientAPI.getAppClientData();
        const binding = clientAPI.getPageProxy().binding;

        // Get StopUUID from app client data or current binding
        const stopUUID =
            appCD.currentStop?.StopUUID ||
            binding?.StopUUID;

        if (!stopUUID) {
            return '';
        }

        // Build Stop entity ReadLink
        const stopReadLink = `Stops(guid'${stopUUID}')`;

        return stopReadLink;

    } catch (err) {
        return '';
    }
}
