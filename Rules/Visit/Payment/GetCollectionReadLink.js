/**
 * Get Collection ReadLink for current Stop
 * If not found, return Stop ReadLink
 * @param {IClientAPI} clientAPI
 */
export default async function GetCollectionReadLink(clientAPI) {
    try {
        alert('Rule started');

        const appCD = clientAPI.getAppClientData();
        const stopRef = appCD.currentStop || clientAPI.getPageProxy().binding;

        if (!stopRef || !stopRef.StopUUID) {
            alert('Stop binding or StopUUID missing');
            return "";
        }

        const stopUUID = stopRef.StopUUID;
        alert(`Current StopUUID: ${stopUUID}`);

        const stopReadLink = `Stops(guid'${stopUUID}')`;
        alert(`Stop ReadLink: ${stopReadLink}`);

        const service = '/LMD_MDKApp/Services/LMD_MA.service';

        // Read Collections for this StopUUID
        const collectionsResult = await clientAPI.read(
            service,
            'Collections',
            [],
            `$filter=StopUUID eq guid'${stopUUID}'`
        );

        alert(`Collections found: ${collectionsResult.length}`);

        if (collectionsResult && collectionsResult.length > 0) {
            const collection = collectionsResult.getItem(0);
            const collectionReadLink = collection['@odata.readLink'];

            alert(`Collection found, ReadLink:\n${collectionReadLink}`);

            appCD.CollectionReadLink = collectionReadLink;
            return collectionReadLink;
        }

        alert('No Collection found for this Stop, returning Stop ReadLink');
        return stopReadLink;

    } catch (err) {
        alert('Error in GetCollectionOrStopReadLink: ' + err.message);
        return "";
    }
}
