export default async function RouteEndDateTimeReadLink(context) {
    try {
        // Execute ReadRouteByUUID action
        const readResult = await context.executeAction('/LMD_MDKApp/Actions/Main/Routes/ReadRouteByUUID.action');
        //alert(`Raw ReadRouteByUUID result:\n${JSON.stringify(readResult, null, 2)}`);

        const dataArray = readResult?.data?._array;

        if (!dataArray || dataArray.length === 0) {
            //alert('No route objects found inside observable array.');
            return null;
        }

        const route = dataArray[0];
        const routeReadLink = route['@odata.readLink'] || null;

        if (!routeReadLink) {
            //alert('Route object found but missing @odata.readLink.');
            return null;
        }

        //alert('Extracted routeReadLink: ' + routeReadLink);
        return routeReadLink;

    } catch (err) {
        alert('Error in RouteEndDateTimeReadLink: ' + err.message);
        return null;
    }
}
