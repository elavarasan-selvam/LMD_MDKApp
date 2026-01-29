export default function GetSelectedOpenItemAccountingDoc(clientAPI) {

    const appData = clientAPI.getAppClientData();

    if (appData.SelectedOpenItem && appData.SelectedOpenItem.AccountingDocument) {
        return appData.SelectedOpenItem.AccountingDocument;
    }

    return '';
}