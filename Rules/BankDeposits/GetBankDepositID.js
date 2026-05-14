export default async function GetDepositStopUniqueID(clientAPI) {

    try {

        const routeUUID = clientAPI.getAppClientData().EarliestRouteUUID;

        const service = '/LMD_MDKApp/Services/LMD_MA.service';

        const routeReadLink = `Routes(guid'${routeUUID}')`;

        const stopsResult = await clientAPI.read(
            service,
            `${routeReadLink}/to_Stops`,
            [],
            `$filter=StopType eq 'DEPOSIT'`
        );

        if (!stopsResult || stopsResult.length === 0) {
            return '';
        }

        const stop = stopsResult.getItem(stopsResult.length - 1);

        const readLink = stop['@odata.readLink'];

        // Extract value inside X''
        const match = readLink.match(/X'(.*?)'/);

        const uniqueValue = match ? match[1] : '';

        //  First 10 characters only
        const shortID = uniqueValue.substring(0, 10);


        return shortID;

    } catch (e) {

        alert(e.message);

        return '';
    }
}