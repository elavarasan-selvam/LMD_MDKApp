/**
 * Build OpenItems filter with RouteUUID + StopUUID + Payer + Amount > 0
 * @param {IClientAPI} context
 */
export default function GetOpenItemsQuery(context) {
    const appCD = context.getAppClientData();
    const stop = appCD.currentStop || context.getPageProxy().binding;

    const routeUUID = stop?.RouteUUID;
    const stopUUID  = stop?.StopUUID;
    const payerRaw  = stop?.ShipToID;
    const locationID = stop?.LocationID;

    if (!stopUUID || !payerRaw) {
        //alert('StopUUID or ShipToID missing');
        return '';
    }

    // Normalize ShipToID to 10 digits
    const shipTo = payerRaw.toString().padStart(10, '0');

    //alert(
    //   'Filtering OpenItems with:\n' +
    //    'StopUUID: ' + stopUUID + '\n' +
    //    'Payer: ' + shipTo
    //);

    // Build OData $filter string with Amount > 0
    //const filter = `$orderby=ReferenceDocumentDate desc&$filter=StopUUID eq guid'${stopUUID}',Payer eq '${LocationID}',Amount gt 0`;
    const filter = `$filter=StopUUID eq guid'${stopUUID}' and Payer eq '${locationID}'`;
    //alert('OData $filter → ' + filter);

    return filter;
}
