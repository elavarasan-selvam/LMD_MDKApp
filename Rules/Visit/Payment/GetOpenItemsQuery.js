/**
 * Debug OpenItems filter + sort + multi-field search
 * @param {IClientAPI} context
 */
export default async function GetOpenItemsQuery(context) {

    const appCD = context.getAppClientData();
    const stop = appCD.currentStop || context.getPageProxy().binding;

    const stopUUID   = stop?.StopUUID;
    const payerRaw   = stop?.ShipToID;
    const locationID = stop?.LocationID;

    if (!stopUUID || !payerRaw) {
        alert('StopUUID or ShipToID missing');
        return '';
    }

    try {

        // Step 1: Read all OpenItems for the stop and payer
        const result = await context.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'OpenItems',
            [],
            `$filter=Payer eq '${locationID}'`
        );

        if (!result || result.length === 0) {
            return `$filter=false`;
        }

        // Step 2: Keep only rows with Amount > 0 and valid AssignmentReference
        const validDocs = result
            .filter(item => item.Amount > 0 && item.AssignmentReference && item.AssignmentReference.trim().length > 0)
            .map(item => ({
                AccountingDocument: item.AccountingDocument,
                AssignmentReference: item.AssignmentReference,
                Amount: item.Amount,
                ReferenceDocumentDate: item.ReferenceDocumentDate,
                // **Concatenate for multi-field search**
                SearchKey: `${item.AccountingDocument} ${item.AssignmentReference} ${item.Amount}`
            }));

        if (validDocs.length === 0) {
            return `$filter=false`;
        }

        // Step 3: Build final filter + sorting
        const finalQuery =
            `$filter=${validDocs.map(i => `AccountingDocument eq '${i.AccountingDocument}'`).join(' or ')}` +
            `&$orderby=ReferenceDocumentDate desc, AccountingDocument desc`;

        return finalQuery;

    } catch (err) {
        alert('Error in GetOpenItemsQuery:\n' + err);
        return `$filter=false`;
    }
}