export default async function OnWillUpdate(clientAPI) {
    try {
        const result = await clientAPI.executeAction('/LMD_MDKApp/Actions/Application/OnWillUpdate.action');

        if (!result.data) {
            throw new Error('User Deferred');
        }

        // Array of offline store close actions
        const closeActions = [
            { name: 'LMD_MA', path: '/LMD_MDKApp/Actions/LMD_MA/Service/CloseOffline.action' },
            { name: 'API_PRODUCT_SRV', path: '/LMD_MDKApp/Actions/API_PRODUCT_SRV/Service/CloseOffline.action' },
            { name: 'MD_BUSINESSPARTNER_SRV', path: '/LMD_MDKApp/Actions/MD_BUSINESSPARTNER_SRV/Service/CloseOffline.action' },
            // Add other services if needed
        ];

        // Loop through each service and try to close
        for (let store of closeActions) {
            try {
                await clientAPI.executeAction(store.path);
                //alert(store.name + " closed successfully"); // optional success alert
            } catch (err) {
                if (err.message.includes("engine already running")) {
                    alert("Engine already running for " + store.name);
                } else {
                    alert("Failed to close " + store.name + ": " + err.message);
                }
            }
        }

        return true;

    } catch (err) {
        alert("OnWillUpdate Failed: " + err.message);
        return false;
    }
}
