/**
 * Return CHECKOUT Stop ReadLink
 * @param {IClientAPI} context
 */
export default async function COCI_Checkoutpaymentreadlink(context) {
    try {
        // Step 1: Execute Read Stops Action
        const readResult = await context.executeAction(
            '/LMD_MDKApp/Actions/StartCheckout/Checkout/CheckoutCOCIReadLink.action'
        );

        alert(`Raw ReadAllStops result:\n${JSON.stringify(readResult, null, 2)}`);

        const stopsArray = readResult?.data?._array;

        if (!stopsArray || stopsArray.length === 0) {
            alert('No stops found from Read action.');
            return "";
        }

        // Step 2: Find CHECKOUT Stop
        let checkoutStopUUID = "";

        for (let i = 0; i < stopsArray.length; i++) {
            const stop = stopsArray[i];

            if (stop.StopType === 'CHECKOUT') {
                checkoutStopUUID = stop.StopUUID;
                break;
            }
        }

        if (!checkoutStopUUID) {
            alert('No CHECKOUT StopType found in stops list.');
            return "";
        }

        // Step 3: Build ReadLink
        const checkoutStopReadLink = `Stops(guid'${checkoutStopUUID}')`;

        //  Step 4: Store ReadLink in AppClientData
        const appData = context.getAppClientData();
        appData.Checkout_StopReadLink = checkoutStopReadLink;

        alert(`Final CHECKOUT Stop ReadLink:\n${checkoutStopReadLink}`);

        //  Step 5: RETURN READLINK (not UUID)
        return checkoutStopReadLink;

    } catch (err) {
        alert('Error in COCI_Checkoutpaymentreadlink: ' + err.message);
        return "";
    }
}
