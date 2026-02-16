export default async function ReInitialize(context) {
    try {
        context.showActivityIndicator('Checking for assigned routes...');
        const appCD = context.getAppClientData();
        for (let key in appCD) {
            delete appCD[key];
        }
        // -------------------- STEP 0: Offline Store Initialization --------------------
        const initServices = [
            { name: 'LMD_MA', path: '/LMD_MDKApp/Actions/LMD_MA/Service/InitializeOffline.action' },
            { name: 'MD_BUSINESSPARTNER_SRV', path: '/LMD_MDKApp/Actions/MD_BUSINESSPARTNER_SRV/Service/InitializeOffline.action' },
            { name: 'API_PRODUCT_SRV', path: '/LMD_MDKApp/Actions/API_PRODUCT_SRV/Service/InitializeOffline.action' },
        ];

        for (let service of initServices) {
            try {
                await context.executeAction(service.path);
                //alert(service.name + " initialized successfully"); // optional success alert
            } catch (err) {
                if (err.message.includes("engine already running")) {
                    alert("Engine already running for " + service.name);
                } else if (err.message.includes("could not find the service provider")) {
                    alert("Service provider missing for " + service.name);
                } else {
                    alert("Failed to initialize " + service.name + ": " + err.message);
                }
            }
        }

        // -------------------- STEP 1: Get logged-in UserId --------------------
        let loggedInEmail = null;
        try {
            loggedInEmail = context.evaluateTargetPath("#Application/#AppData/UserId");
        } catch (err) {
            alert("Failed to get UserId: " + err.message);
        }

        if (!loggedInEmail) {
            alert("No logged-in email found in AppData.");
            return;
        }
        loggedInEmail = loggedInEmail.trim().toUpperCase();
        // -------------------- STEP 2: Read Business Partner --------------------
        let bpResult = [];
        try {
            bpResult = await context.read(
                "/LMD_MDKApp/Services/MD_BUSINESSPARTNER_SRV.service",
                "C_BPEmailAddress",
                [],
                ""
            );
        } catch (err) {
            alert("Failed to read Business Partner service: " + err.message);
            return;
        }

        if (!bpResult || bpResult.length === 0) {
            alert("No Business Partner records found.");
            return;
        }

        let matchedBP = null;
        for (let i = 0; i < bpResult.length; i++) {
            const email = (bpResult.getItem(i).EmailAddress || "").trim().toUpperCase();
            if (email === loggedInEmail) {
                matchedBP = bpResult.getItem(i).BusinessPartner;
                break;
            }
        }

        if (!matchedBP) {
            alert("No matching Business Partner found for email: " + loggedInEmail);
            return;
        }
        appCD.BusinessPartnerID = matchedBP;

        // -------------------- STEP 3: Fetch Routes --------------------
        let routeResult = [];
        try {
            routeResult = await context.read(
                "/LMD_MDKApp/Services/LMD_MA.service",
                "Routes",
                [],
                `$filter=MainDriverID eq '${matchedBP}'`
            );
        } catch (err) {
            alert("Failed to read Routes service: " + err.message);
            return;
        }
         // ---------- NO ROUTES → GO TO MAIN PAGE ----------
        if (!routeResult || routeResult.length === 0) {

            context.dismissActivityIndicator();

            await context.executeAction({
                Name: '/LMD_MDKApp/Actions/GenericToastMessage.action',
                Properties: {
                    Message: 'No Routes Available',
                    Duration: 2
                }
            });
            return context.executeAction(
                '/LMD_MDKApp/Actions/Nav_To_NoRoutes.action'
            );
        }

        appCD.RouteUUIDs = routeResult.map(r => r.RouteUUID);
        appCD.RoutePlannedTimes = routeResult.map(r => ({
            RouteUUID: r.RouteUUID,
            PlannedStartDateTime: r.PlannedStartDateTime
        }));

        // Earliest route
        const earliestRoute = appCD.RoutePlannedTimes.reduce((earliest, current) => {
            return new Date(current.PlannedStartDateTime) < new Date(earliest.PlannedStartDateTime)
                ? current
                : earliest;
        }, appCD.RoutePlannedTimes[0]);

        appCD.EarliestRouteUUID = earliestRoute.RouteUUID;
        appCD.RouteFilter = `$filter=RouteUUID eq guid'${earliestRoute.RouteUUID}'`;

        // -------------------- STEP 4: Success Toast --------------------
        await context.executeAction({
            Name: "/LMD_MDKApp/Actions/GenericToastMessage.action",
            Properties: {
                Message: "Application Initialized & BP Data Loaded Successfully",
                Animated: true,
                Duration: 1,
                IsIconHidden: true,
                NumberOfLines: 1
            }
        });
        context.dismissActivityIndicator();
        return context.executeAction('/LMD_MDKApp/Actions/Nav_To_MainPage.action');

    } catch (error) {
        alert("ReInitialization Error: " + error.message);
        return false;
    }
}
