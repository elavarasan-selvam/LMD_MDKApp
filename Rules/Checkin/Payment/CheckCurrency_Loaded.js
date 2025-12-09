export default async function CheckCurrency_Loaded(clientAPI) {

    const binding = clientAPI.getPageProxy().binding;
    if (!binding || !binding.RouteUUID) {
        alert("RouteUUID missing");
        return "";
    }

    const routeUUID = binding.RouteUUID;
    //alert("RouteUUID: " + routeUUID);

    try {
        // -------------------------------
        // 1. CHECK CHECKIN STOP FIRST
        // -------------------------------
        const checkinStops = await clientAPI.read(
            "/LMD_MDKApp/Services/LMD_MA.service",
            "Stops",
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKIN'`
        );

        if (checkinStops && checkinStops.length > 0) {

            const checkinStopUUID = checkinStops.getItem(0).StopUUID;
            //alert("CHECKIN Stop Found: " + checkinStopUUID);

            const checkinPayments = await clientAPI.read(
                "/LMD_MDKApp/Services/LMD_MA.service",
                "COCIPayments",
                [],
                `$filter=PaymentType eq 'CH' and StopUUID eq guid'${checkinStopUUID}'`
            );

            if (checkinPayments && checkinPayments.length > 0) {

                const currency = checkinPayments.getItem(0).Currency || "";
                //alert("CHECKIN Currency Found: " + currency);
                return currency;
            }

            //alert("No CH payment in CHECKIN. Moving to VISITS...");
        } 
        else {
            alert("No CHECKIN stop found. Moving to VISITS...");
        }

        // -------------------------------
        // 2. FALLBACK TO VISIT STOPS
        // -------------------------------
        const visitStops = await clientAPI.read(
            "/LMD_MDKApp/Services/LMD_MA.service",
            "Stops",
            [],
            `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'VISIT'`
        );

        if (!visitStops || visitStops.length === 0) {
            alert("No VISIT stops found");
            return "";
        }

        //alert("VISIT Stops Count: " + visitStops.length);

        for (let i = 0; i < visitStops.length; i++) {

            const stopUUID = visitStops.getItem(i).StopUUID;
            //alert("Reading VISIT Stop: " + stopUUID);

            const payments = await clientAPI.read(
                "/LMD_MDKApp/Services/LMD_MA.service",
                "CollectionPayments",
                [],
                `$filter=PaymentType eq 'CH' and StopUUID eq guid'${stopUUID}'`
            );

            if (payments && payments.length > 0) {
                const currency = payments.getItem(0).Currency || "";
                alert("VISIT Currency Found: " + currency);
                return currency;   // first found currency is returned
            }
        }

        //alert("No CH currency found in VISITS");
        return "";

    } catch (e) {
        alert("Error in CheckCurrency_Loaded: " + e);
        return "";
    }
}
