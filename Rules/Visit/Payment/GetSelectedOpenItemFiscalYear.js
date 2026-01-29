export default function GetSelectedOpenItemFiscalYear(clientAPI) {

    const appData = clientAPI.getAppClientData();

    if (appData.SelectedOpenItem && appData.SelectedOpenItem.FiscalYear) {
        return appData.SelectedOpenItem.FiscalYear;
    }

    return '';
}