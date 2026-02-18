export default async function GetOpenItemsQuery(context) {

    const appCD = context.getAppClientData();
    const stop = appCD.currentStop || context.getPageProxy().binding;

    const locationID = stop?.LocationID;

    if (!locationID) {
        return `$filter=false`;
    }

    const searchText = context.searchString;

    try {

        const result = await context.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'OpenItems',
            [],
            `$filter=Payer eq '${locationID}'`
        );

        if (!result || result.length === 0) {
            return `$filter=false`;
        }

        let validDocs = result.filter(item =>
            item.Amount > 0 &&
            item.AssignmentReference &&
            item.AssignmentReference.trim().length > 0
        );

        // APPLY SEARCH MANUALLY
        if (searchText && searchText.length > 0) {

            const lowerSearch = searchText.toLowerCase();

            validDocs = validDocs.filter(item =>
                item.AccountingDocument?.toLowerCase().includes(lowerSearch) ||
                item.AssignmentReference?.toLowerCase().includes(lowerSearch) ||
                item.Amount?.toString().includes(lowerSearch)
            );
        }

        if (validDocs.length === 0) {
            return `$filter=false`;
        }

        const finalQuery =
            `$filter=${validDocs.map(i =>
                `AccountingDocument eq '${i.AccountingDocument}'`
            ).join(' or ')}` +
            `&$orderby=ReferenceDocumentDate desc, AccountingDocument desc`;

        return finalQuery;

    } catch (err) {
        alert('Error in GetOpenItemsQuery:\n' + err);
        return `$filter=false`;
    }
}
