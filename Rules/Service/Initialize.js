export default async function Initialize(context) {

    try {
        
        // -------------------- STEP 1: Initialize Services --------------------
        //let _DEST_SAMLMD_PPROP = context.executeAction('/LMD_MDKApp/Actions/DEST_SAMLMD_PPROP/Service/InitializeOffline.action');
        let _LMD_MA = context.executeAction('/LMD_MDKApp/Actions/LMD_MA/Service/InitializeOffline.action');
        let _MD_BUSINESSPARTNES_SRV = context.executeAction('/LMD_MDKApp/Actions/MD_BUSINESSPARTNER_SRV/Service/InitializeOffline.action');
        let _API_PRODUCT_SRV = context.executeAction('/LMD_MDKApp/Actions/API_PRODUCT_SRV/Service/InitializeOffline.action')
      
      
        await Promise.all([_LMD_MA,_MD_BUSINESSPARTNES_SRV, _API_PRODUCT_SRV]);

        // -------------------- STEP 2: Business Partner Logic --------------------
        let loggedInEmail = context.evaluateTargetPath("#Application/#AppData/UserId");
        if (!loggedInEmail) {
            alert("No logged-in email found in AppData.");
            return;
        }

        loggedInEmail = loggedInEmail.trim().toUpperCase();
        //alert("Normalized Logged-in Email: " + loggedInEmail);

        // Read Business Partner emails
        const bpResult = await context.read(
            "/LMD_MDKApp/Services/MD_BUSINESSPARTNER_SRV.service",
            "C_BPEmailAddress",
            [],
            ""
        );

        if (!bpResult || bpResult.length === 0) {
            alert(" No Business Partner email records found.");
            return;
        }

        // Find matching BP
        let matchedBP = null;
        for (let i = 0; i < bpResult.length; i++) {
            const email = (bpResult.getItem(i).EmailAddress || "").trim().toUpperCase();
            if (email === loggedInEmail) {
                matchedBP = bpResult.getItem(i).BusinessPartner;
                break;
            }
        }

        if (!matchedBP) {
            //alert("No matching Business Partner found for email: " + loggedInEmail);
            return;
        }

        //alert("Found Business Partner ID: " + matchedBP);

        // -------------------- STEP 3: Fetch Routes for that BP --------------------
        const smaService = "/LMD_MDKApp/Services/LMD_MA.service";
        const routeEntity = "Routes";
        const routeQuery = `$filter=MainDriverID eq '${matchedBP}'`;

        //alert("Searching Routes where MainDriverID eq " + matchedBP);

        const routeResult = await context.read(smaService, routeEntity, [], routeQuery);

        if (!routeResult || routeResult.length === 0) {
            //alert(" No Routes found for Business Partner ID: " + matchedBP);
            return;
        }

        // Collect RouteUUIDs and PlannedStartDateTime
        let routeUUIDs = [];
        let routePlannedTimes = [];
        for (let i = 0; i < routeResult.length; i++) {
            let item = routeResult.getItem(i);
            routeUUIDs.push(item.RouteUUID);
            routePlannedTimes.push({
                RouteUUID: item.RouteUUID,
                PlannedStartDateTime: item.PlannedStartDateTime
            });
        }

        //alert(" Found " + routeUUIDs.length + " Routes:\n" + routeUUIDs.join("\n"));
        //alert("PlannedStartDateTimes:\n" + routePlannedTimes.map(r => r.RouteUUID + " → " + r.PlannedStartDateTime).join("\n"));

        // -------------------- STEP 4: Store in AppClientData --------------------
        let appCD = context.getAppClientData();
        appCD.BusinessPartnerID = matchedBP;
        appCD.RouteUUIDs = routeUUIDs;
        appCD.RoutePlannedTimes = routePlannedTimes;

        // Find earliest route
        if (routePlannedTimes.length > 0) {
            let earliestRoute = routePlannedTimes[0];
            for (let i = 1; i < routePlannedTimes.length; i++) {
                if (new Date(routePlannedTimes[i].PlannedStartDateTime) < new Date(earliestRoute.PlannedStartDateTime)) {
                    earliestRoute = routePlannedTimes[i];
                }
            }
            appCD.EarliestRouteUUID = earliestRoute.RouteUUID;
            //alert("Earliest RouteUUID: " + earliestRoute.RouteUUID + "\nPlannedStartDateTime: " + earliestRoute.PlannedStartDateTime);
        }
        //const appCD = context.getAppClientData();
        let uuid = appCD.EarliestRouteUUID;

        if (!uuid) {
            alert(" No EarliestRouteUUID found in AppClientData.");
        }else {
            let filter = `$filter=RouteUUID eq guid'${uuid}'`;
            //alert(" Generated Filter: " + filter);
            appCD.RouteFilter = filter; // store for reuse
        }

        // -------------------- STEP 6: Success Message --------------------
        await context.executeAction({
            "Name": "/LMD_MDKApp/Actions/GenericToastMessage.action",
            "Properties": {
                "Message": "Application Initialized & BP Data Loaded Successfully",
                "Animated": true,
                "Duration": 1,
                "IsIconHidden": true,
                "NumberOfLines": 1
            }
        });
        return context.executeAction('/LMD_MDKApp/Actions/Nav_To_MainPage.action');
    } catch (error) {
        alert("Initialization Error: " + error.message);
        return false;
    }
}
