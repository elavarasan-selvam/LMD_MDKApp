export default function Checkout_ActualQuantity(clientAPI) {
    const appData = clientAPI.getAppClientData();
    return appData.Checkout_Quantity || 0;
}