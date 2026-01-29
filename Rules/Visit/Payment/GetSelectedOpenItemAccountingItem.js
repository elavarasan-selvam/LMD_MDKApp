export default function GetSelectedOpenItemAccountingItem(clientAPI) {

    const appData = clientAPI.getAppClientData();

    if (appData.SelectedOpenItem && appData.SelectedOpenItem.AccountingDocumentItem) {
        return appData.SelectedOpenItem.AccountingDocumentItem;
    }

    return '';
}