export default async function GetDepositStopReadLink(clientAPI) {

    try {

        const routeUUID = clientAPI.getAppClientData().EarliestRouteUUID;

        if (!routeUUID) {
            alert("RouteUUID missing");
            return '';
        }

        const service = '/LMD_MDKApp/Services/LMD_MA.service';

        const routeReadLink = `Routes(guid'${routeUUID}')`;

        const stopsResult = await clientAPI.read(
            service,
            `${routeReadLink}/to_Stops`,
            [],
            `$filter=StopType eq 'DEPOSIT'`
        );

        if (!stopsResult || stopsResult.length === 0) {
            alert("No DEPOSIT Stops Found");
            return '';
        }

        // LAST CREATED STOP
        const stop = stopsResult.getItem(stopsResult.length - 1);


        const readLink = stop['@odata.readLink'];

        return readLink;

    } catch (e) {

        alert("ERROR = " + e.message);

        return '';
    }
}