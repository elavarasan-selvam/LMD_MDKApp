/*

export default function GetReturnDescription(context) {
    try {
        const isConfirmed = context.getAppClientData().ReturnConfirmedByStop;

        if (isConfirmed === true) {
            return "";
        }

        const binding = context.binding;
        const service = "/LMD_MDKApp/Services/LMD_MA.service";

        // ✅ If only OrderedQuantity exists
        return context.read(
            service,
            "DocumentItems",
            [],
            `$filter=DocumentUUID eq guid'${binding.DocumentUUID}' and OrderedQuantity ne null`
        ).then(result => {
            if (result && result.length > 0) {
                return "Planned returns to collect.";
            } else {
                return "No planned returns to collect.";
            }
        });
    } catch (error) {
        context.getLogger().error("GetReturnDescription Error: " + error);
        return "No planned returns to collect.";
    }
}

*/

export default function GetReturnDescription(context) {
    try {
        const appCD = context.getAppClientData();
        const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

   
        if (stopUUID && appCD.ReturnConfirmedByStop?.[stopUUID] === true) {
            return "";
        }

        const binding = context.binding;
        const service = "/LMD_MDKApp/Services/LMD_MA.service";

        
        return context.read(
            service,
            "DocumentItems",
            [],
            `$filter=DocumentUUID eq guid'${binding.DocumentUUID}' and OrderedQuantity ne null`
        ).then(result => {
            if (result && result.length > 0) {
                return "Planned returns to collect.";
            }
            return "No planned returns to collect.";
        });

    } catch (error) {
        context.getLogger().error("GetReturnDescription Error: " + error);
        return "No planned returns to collect.";
    }
}
