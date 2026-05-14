export default async function GetNextStopSequence(clientAPI) {

    try {

        const routeUUID = clientAPI.getAppClientData().EarliestRouteUUID;

        if (!routeUUID) {
            return "1";
        }

        const result = await clientAPI.read(
            '/LMD_MDKApp/Services/LMD_MA.service',
            'Stops',
            [],
            `$filter=RouteUUID eq guid'${routeUUID}'`
        );

        let maxCompletedSeq = 0;
        let checkInSeq = 999999; // fallback high value

        for (let i = 0; i < result.length; i++) {

            const stop = result.getItem(i);

            let seq = parseFloat(stop.Sequence || "0");

            //  ONLY completed stops
            if (stop.EndDateTime) {
                if (seq > maxCompletedSeq) {
                    maxCompletedSeq = seq;
                }
            }

            //  capture check-in sequence
            if (stop.StopType === "CHECKIN" && seq < checkInSeq) {
                checkInSeq = seq;
            }
        }

        // Next sequence candidate
        let nextSeq = maxCompletedSeq + 1;

        // enforce SAP rule: must be < check-in sequence
        if (nextSeq >= checkInSeq) {
            nextSeq = checkInSeq - 0.001;
        }

        return nextSeq.toString();

    } catch (e) {
        alert("ERROR = " + e.message);
        return "1";
    }
}