export default function GetSelectedOpenItemAmount(clientAPI) {

    const appData = clientAPI.getAppClientData();

    if (appData.SelectedOpenItem && appData.SelectedOpenItem.Amount) {
        return appData.SelectedOpenItem.Amount;
    }

    return 0; // fallback (never return null)
}