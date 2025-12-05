export default async function COCIProduct_CheckoutReadLink(clientAPI) {
    try {
        const readResult = await clientAPI.executeAction(
            '/LMD_MDKApp/Actions/StartCheckout/Checkout/CheckoutCOCIReadLink.action'
        );

        const stopsArray = readResult && readResult.data && readResult.data._array;

        if (!stopsArray || stopsArray.length === 0) {
            alert("No stops found from Checkout Read action.");
            return "";
        }

        let CheckoutStopUUID = "";

        for (let i = 0; i < stopsArray.length; i++) {
            const stop = stopsArray[i];

            if (stop.StopType === "CHECKOUT") {
                CheckoutStopUUID = stop.StopUUID;
                const appData = clientAPI.getAppClientData();
                appData.CheckoutActualStopUUID = CheckoutStopUUID;
                break;
            }
        }

        if (!CheckoutStopUUID) {
            alert("No Checkout StopType found in stops list.");
            return "";
        }

        const readLink = `Stops(guid'${CheckoutStopUUID}')`;

        alert("Final Checkout COCIProduct ReadLink:\n" + readLink);

        return readLink;

    } catch (e) {
        alert("Error in COCIProduct_CheckoutReadLink:\n" + e.message);
        return "";
    }
}
