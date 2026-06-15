/**
 * Describe this function...
 /**
 * @param {IClientAPI} context
 */

export default async function GetSoldToPartyID(context) {
    try {
    const appCD = context.getAppClientData();
    const stop = appCD.currentStop || context.getPageProxy().binding;
    //alert("stop:" + JSON.stringify(stop));
 
    const locationID = stop?.ShipToID;
   return locationID || "";
 
    } catch (err) {
    //    alert('Error :\n' + err);
        return "";
    }
}