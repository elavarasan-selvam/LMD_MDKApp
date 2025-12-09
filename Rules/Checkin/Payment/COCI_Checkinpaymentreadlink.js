export default async function COCI_Checkinpaymentreadlink(context) {
    try {
        const readResult = await context.executeAction(
            '/LMD_MDKApp/Actions/StartCheckout/Checkout/CheckoutCOCIReadLink.action'
        );

        //alert("Raw ReadAllStops result:\n" + JSON.stringify(readResult, null, 2));

        const stopsArray = readResult && readResult.data && readResult.data._array;

        if (!stopsArray || stopsArray.length === 0) {
            //alert("No stops found from Read action.");
            return "";
        }

        let CheckinStopUUID = "";

        for (let i = 0; i < stopsArray.length; i++) {
            const stop = stopsArray[i];

            if (stop.StopType === "CHECKIN") {
                CheckinStopUUID = stop.StopUUID;
                break;
            }
        }

        if (!CheckinStopUUID) {
            alert("No Checkin StopType found in stops list.");
            return "";
        }

        const CheckinStopReadLink = `Stops(guid'${CheckinStopUUID}')`;

        const appData = context.getAppClientData();
        appData.Checkin_StopReadLink = CheckinStopReadLink;

        //alert("Final CHECKIN Stop ReadLink:\n" + CheckinStopReadLink);

        return CheckinStopReadLink;

    } catch (err) {
        alert("Error in COCI_Checkinpaymentreadlink: " + err.message);
        return "";
    }
}
