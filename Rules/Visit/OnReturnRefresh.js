/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function OnReturnRefresh(context) {

     return context.getPageProxy().redraw();
}
