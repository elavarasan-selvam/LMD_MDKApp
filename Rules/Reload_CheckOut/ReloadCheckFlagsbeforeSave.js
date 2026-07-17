/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
export default function ReloadCheckFlagsbeforeSave(clientAPI) {
    let binding = clientAPI.binding;

    // Flag set by ReloadSetReasonFlag.js
    let loadedFlag = binding._LoadedChanged || 0;
    alert(`On Save → LoadedFlag=${loadedFlag}`);
    // No changes made
    if (loadedFlag === 0) {
        return clientAPI.executeAction(
            "/LMD_MDKApp/Actions/CloseModalPage_Complete.action"
        );
        alert("No changes made → Just navigate");
    }
    // Loaded value changed
    if (loadedFlag === 1) {
        return clientAPI.executeAction(
            "/LMD_MDKApp/Actions/ReloadCheckout/ReloadProduct_Create.action"
        );}
             alert("Loaded value changed → Do Update");
}*/

/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function ReloadCheckFlagsbeforeSave(clientAPI) {
    let binding = clientAPI.binding;

    // Flag set by ReloadSetReasonFlag.js
    let loadedFlag = binding._LoadedChanged || 0;
    

//    alert(`On Save → LoadedFlag=${loadedFlag}`);

    // No changes made
    if (loadedFlag === 0) {
    //    alert("No changes made → Just navigate");

        return clientAPI.executeAction(
            "/LMD_MDKApp/Actions/CloseModalPage_Complete.action"
        );
    }

    // Loaded value changed
    if (loadedFlag === 1) {
    //    alert("Loaded value changed → Do Update");

        return clientAPI.executeAction(
            "/LMD_MDKApp/Actions/ReloadCheckout/ReloadProduct_Create.action"
        );
    }

    // Optional: unexpected value
 //   alert(`Unexpected LoadedFlag value: ${loadedFlag}`);
}

