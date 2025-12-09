export default async function UpdateRouteStartDateTime(context) {
    try {
        // Step 1: Get the route from ReadRouteByUUID
        const readResult = context.getActionResult('ReadRouteByUUID');

        // Alert the raw readResult
        //alert('Raw ReadRouteByUUID result:\n' + JSON.stringify(readResult, null, 2));

        // Extract data array
        const dataArray = readResult?.data?._array;

        if (!dataArray || dataArray.length === 0) {
            //alert('No route objects found inside observable array.');
            return;
        }

        const route = dataArray[0];

        // Alert the first route object
        //alert('First route object:\n' + JSON.stringify(route, null, 2));

        const routeReadLink = route['@odata.readLink'];

        if (!routeReadLink) {
            //alert('Route object found but missing @odata.readLink.\nKeys:\n' + Object.keys(route).join('\n'));
            return;
        }

        // Prepare current StartDateTime
        const now = new Date();
        const currentDate = now.toISOString().split('.')[0];

        // Alert before updating
        //alert('Updating StartDateTime for routeReadLink: ' + routeReadLink + '\nTo: ' + currentDate);

        // Step 2: Execute UpdateEntity action
        await context.executeAction({
            Name: "/LMD_MDKApp/Actions/Main/Routes/StartDateTime.action",
            Properties: {
                Target: { ReadLink: routeReadLink },
                Properties: { StartDateTime: currentDate }
            }
        });

        //alert('StartDateTime updated successfully!');

    } catch (err) {
        alert('Error in UpdateRouteStartDateTime: ' + err.message);
    }
}
