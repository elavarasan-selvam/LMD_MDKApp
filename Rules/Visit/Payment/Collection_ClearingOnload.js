export default async function CurrentStop_LastClearingAccDoc(clientAPI) {
    const appCD = clientAPI.getAppClientData();
    const stopRef = appCD.currentStop || clientAPI.getPageProxy().binding;

    if (!stopRef || !stopRef.StopUUID) {
        //alert("No current StopUUID found");
        return "";
    }

    const stopUUID = stopRef.StopUUID;
    const service = "/LMD_MDKApp/Services/LMD_MA.service";

    try {
        // 1. Read Collections for current stop
        const collections = await clientAPI.read(
            service,
            "Collections",
            [],
            `$filter=StopUUID eq guid'${stopUUID}'`
        );

        if (!collections || collections.length === 0) {
            //alert("No collections for current stop: " + stopUUID);
            return "";
        }

        for (let i = 0; i < collections.length; i++) {
            const collectionReadLink = collections.getItem(i)["@odata.readLink"];
            //alert("Collection ReadLink: " + collectionReadLink);

            // 2. Read CollectionPayments for this collection
            const payments = await clientAPI.read(
                service,
                `${collectionReadLink}/to_CollectionPayments`,
                [],
                ''
            );

            if (!payments || payments.length === 0) {
                //alert("No payments for collection: " + collectionReadLink);
                continue;
            }

            for (let j = 0; j < payments.length; j++) {
                const paymentReadLink = payments.getItem(j)["@odata.readLink"];

                // 3. Read CollectionClearings for this payment
                const clearings = await clientAPI.read(
                    service,
                    `${paymentReadLink}/to_CollectionClearings`,
                    [],
                    ''
                );

                if (clearings && clearings.length > 0) {
                    const lastClearing = clearings.getItem(clearings.length - 1);
                    //alert("Last Clearing AccountingDoc: " + lastClearing.AccountingDocument);
                    return lastClearing.AccountingDocument || "";
                } else {
                    //alert("No clearings for payment: " + paymentReadLink);
                }
            }
        }

        //alert("No CollectionClearings found for any payments");
        return "";

    } catch (err) {
        alert("Error fetching last clearing: " + err.message);
        console.log(err);
        return "";
    }
}