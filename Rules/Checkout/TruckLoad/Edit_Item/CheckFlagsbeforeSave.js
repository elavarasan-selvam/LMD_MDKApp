export default function CheckBeforeSave(clientAPI) {
    let binding = clientAPI.binding;

    let orderedFlag = binding._OrderedChanged || 0;
    let reasonCode = binding.ReasonCode || "";

    //alert(`On Save → OrderedFlag=${orderedFlag}, ReasonCode=${reasonCode}`);

    if (orderedFlag === 0) {
        //alert("No OrderedQuantity change → Just navigate");
        return clientAPI.executeAction("/LMD_MDKApp/Actions/CloseModalPage_Complete.action");
    }

    if (orderedFlag === 1) {
        if (!reasonCode || reasonCode === "") {
            // ReasonCode missing → block update
            //alert("ReasonCode missing → show alert");
            return clientAPI.executeAction("/LMD_MDKApp/Actions/StartCheckout/Checkout/TruckLoad/SaveMessageofOQandRC.action");
        } else {
            // Both changed → proceed with update
            //alert("OrderedQuantity changed & ReasonCode present → Do Update");
            return clientAPI.executeAction("/LMD_MDKApp/Actions/StartCheckout/Checkout/TruckLoad/COCIProduct_Create_from_Checkout.action");
        }
    }
}
