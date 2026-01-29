/**
 * Debug OpenItems filter: count before and after filtering Amount > 0 and AssignmentReference
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

    // Step 1: Read all OpenItems for the stop and payer
    const result = await context.read(
        '/LMD_MDKApp/Services/LMD_MA.service',
        'OpenItems',
        [],
        `$filter=StopUUID eq guid'${stopUUID}' and Payer eq '${locationID}'`
    );

    if (!result || result.length === 0) {
        alert('No OpenItems fetched from backend');
        return `$filter=false`;
    }

    //alert('Total OpenItems fetched: ' + result.length);

    // Step 2: Count items with Amount <= 0
    const amountZeroOrNegative = result.filter(item => !item.Amount || item.Amount <= 0).length;
    //alert('OpenItems with Amount <= 0: ' + amountZeroOrNegative);

    // Step 3: Count items with blank/null AssignmentReference
    const blankAssignment = result.filter(item => {
        const ref = item.AssignmentReference;
        return !ref || ref.replace(/\s/g, '').length === 0;
    }).length;
    //alert('OpenItems with blank AssignmentReference: ' + blankAssignment);

    // Step 4: Keep only rows with Amount > 0 and valid AssignmentReference
    const validDocs = result
        .filter(item => {
            const ref = item.AssignmentReference;
            return item.Amount > 0 && ref && ref.replace(/\s/g, '').length > 0;
        })
        .map(item => `AccountingDocument eq '${item.AccountingDocument}'`);

    //alert('OpenItems with Amount > 0 and valid AssignmentReference: ' + validDocs.length);

    if (validDocs.length === 0) {
        return `$filter=false`;
    }

    // Step 5: Build final $filter for MDK ObjectTable
    return `$filter=${validDocs.join(' or ')}`;
}