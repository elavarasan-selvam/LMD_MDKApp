/**
 * OnValueChange for OpenItems Picker
 * Re-reads selected OpenItem to get full data
 */
export default async function OpenItem_OnValueChange(clientAPI) {

    const appData = clientAPI.getAppClientData();
    const selected = clientAPI.getValue();

    if (!selected || selected.length === 0) {
        //alert('No item selected');
        return true;
    }

    const accountingDoc = selected[0].ReturnValue;

    //alert('Selected Accounting Doc: ' + accountingDoc);

    try {

        // Re-read full OpenItem record
        const result = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'OpenItems',
            [],
            `$filter=AccountingDocument eq '${accountingDoc}'`
        );

        if (!result || result.length === 0) {
            //alert('No OpenItem found in read');
            return true;
        }

        const item = result.getItem(0);

        // Store in AppClientData
        appData.SelectedOpenItem = {
            AccountingDocument: item.AccountingDocument,
            AccountingDocumentItem: item.AccountingDocumentItem,
            AssignmentReference: item.AssignmentReference,
            ReferenceDocumentDate: item.ReferenceDocumentDate,
            Amount: item.Amount,
            Currency: item.Currency,
            CompanyCode: item.CompanyCode,
            FiscalYear: item.FiscalYear
        };

        //alert('OpenItem saved locally');

    } catch (err) {
        alert('Read error: ' + err);
        console.log(err);
    }

    return true;
}