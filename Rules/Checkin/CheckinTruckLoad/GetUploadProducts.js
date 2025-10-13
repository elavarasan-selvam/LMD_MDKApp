export default function GetUploadProducts(clientAPI) {
    const appData = clientAPI.getAppClientData();
    return appData.PendingProductList || [];
}