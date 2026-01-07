export default async function LoadVisitAttachments(clientAPI) {

    alert('🔹 LoadVisitAttachments started');

    const appCD = clientAPI.getAppClientData();
    let binding = clientAPI.getPageProxy().binding;

    if (binding) {
        alert('📌 Current binding exists');
        alert('📌 Binding StopUUID: ' + (binding.StopUUID || 'NOT FOUND'));
    } else {
        alert('❌ No page binding found');
    }

    // If already bound to Stop, do nothing
    if (binding?.StopUUID) {
        alert('✅ Page already bound to VISIT Stop. No rebinding needed.');
        return;
    }

    const routeUUID = appCD.currentRouteUUID;
    if (!routeUUID) {
        alert('❌ RouteUUID not found in app client data');
        return;
    }

    alert('📌 RouteUUID from appCD: ' + routeUUID);

    try {
        alert('🔍 Reading VISIT stop from backend...');

        const stopResult = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'VISIT'`
        );

        if (!stopResult || stopResult.length === 0) {
            alert('❌ No VISIT stop found for this route');
            return;
        }

        alert('✅ VISIT stop found. Count: ' + stopResult.length);

        const visitStop = stopResult.getItem(0);
        alert('📌 VISIT StopUUID: ' + visitStop.StopUUID);

        clientAPI.getPageProxy().setBinding(visitStop);
        alert('✅ Page binding successfully set to VISIT stop');

    } catch (e) {
        alert('❌ Error in LoadVisitAttachments: ' + e.message);
    }
}
