export default function GetSelectedOpenItemCompanyCode(clientAPI) {

    const appData = clientAPI.getAppClientData();

    if (appData.SelectedOpenItem && appData.SelectedOpenItem.CompanyCode) {
        return appData.SelectedOpenItem.CompanyCode;
    }

    return '';
}