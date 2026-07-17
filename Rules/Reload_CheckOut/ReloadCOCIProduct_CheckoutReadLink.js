/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default async function ReloadCOCIProduct_CheckoutReadLink(clientAPI) {
    try {
        const reloadreadResult = await clientAPI.executeAction(
            '/LMD_MDKApp/Actions/StartCheckout/Checkout/CheckoutCOCIReadLink.action'
        );

        const stopsArray = reloadreadResult && reloadreadResult.data && reloadreadResult.data._array;

        if (!stopsArray || stopsArray.length === 0) {
//            alert("No stops found from Checkout Read action.");
            return "";
        }

        let ReCheckoutStopUUID = "";

        for (let i = 0; i < stopsArray.length; i++) {
            const stop = stopsArray[i];

            if (stop.StopType === "RELOAD_CO") {
                ReCheckoutStopUUID = stop.StopUUID;
                const appData = clientAPI.getAppClientData();
                appData.CheckoutActualStopUUID = ReCheckoutStopUUID;
                break;
            }
        }

        if (!ReCheckoutStopUUID) {
    //        alert("No Checkout StopType found in stops list.");
            return "";
        }

        const reloadreadLink = `Stops(guid'${ReCheckoutStopUUID}')`;

  //      alert("Final Checkout COCIProduct ReadLink:\n" + reloadreadLink);

        return reloadreadLink;

    } catch (e) {
//        alert("Error in COCIProduct_CheckoutReadLink:\n" + e.message);
        return "";
    }
}

