export default async function UpdateRouteStartDateTime(context) {
    try {
        //alert('JS started');

        // Step 1: Get the route from ReadRouteByUUID
        const readResult = context.getActionResult('ReadRouteByUUID');
        const dataArray = readResult?.data?._array;

        if (!dataArray || dataArray.length === 0) {
            alert('No route objects found inside observable array.');
            return;
        }

        const route = dataArray[0];
        const routeReadLink = route['@odata.readLink'];

        if (!routeReadLink) {
            alert('Route object found but missing @odata.readLink.\nKeys:\n' + Object.keys(route).join('\n'));
            return;
        }

        //alert('Extracted routeReadLink: ' + routeReadLink);

        // Step 2: Prepare the current StartDateTime
        const now = new Date();
        const currentDate = now.toISOString().split('.')[0];
        //alert('Updating StartDateTime to: ' + currentDate);

        // Step 3: Execute UpdateEntity action directly from JS
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
