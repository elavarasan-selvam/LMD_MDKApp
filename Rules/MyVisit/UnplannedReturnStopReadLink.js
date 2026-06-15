/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */

    export default async function CaptureDocumentID(context) {
    try {
        
        const appCD = context.getAppClientData();
        const currentStop =
            appCD.currentStop ||
            context.getPageProxy().binding ||
            context.binding;
        const stopUUID = currentStop.StopUUID;
       // const routeUUID = currentStop.RouteUUID;
        const stopreadlink = `Stops(guid'${stopUUID}')`;
        return stopreadlink;
        }
    catch (e) {
        context.getLogger().error(e);
    }
}

