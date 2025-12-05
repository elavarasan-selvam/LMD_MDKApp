export default function Checkout_ActualUOM(clientAPI) {
    const appData = clientAPI.getAppClientData();
    const uom = (appData.Checkout_UOM || "").trim().toUpperCase();
    alert("ActualUOM sent to backend: " + uom);
    return uom;
}
