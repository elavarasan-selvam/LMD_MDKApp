export default function GetStopReadLink(clientAPI) {

    const appData = clientAPI.getAppClientData();

    // Always use visit stop for Checkin COCI products
    const stop = appData.currentStop;

    if (!stop || !stop.StopUUID) {
        //alert("Visit StopUUID missing!");
        return "";
    }

    const stopUUID = stop.StopUUID;
    const stopID = stop.StopID;

    //alert("Visit Stop Loaded:\n" +"StopID: " + stopID + "\n" +"StopUUID: " + stopUUID);

    const readLink = stop['@odata.readLink'] || `Stops(guid'${stopUUID}')`;

    //alert("Final ReadLink:\n" + readLink);

    return readLink;
}
