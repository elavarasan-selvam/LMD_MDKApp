export default function IsStartButtonVisibleForMobileSalesDocument(context) {

    try {

        const appCD = context.getAppClientData();
        const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

        // Mobile Sales Document completed → hide Start button
        if (
            stopUUID &&
            appCD.MobileSalesDocumentByStop?.[stopUUID] === true
        ) {
            return false;
        }

        // Not completed → show Start button
        return true;

    } catch (e) {

        context.getLogger().error(
            "IsStartButtonVisibleForMobileSalesDocument error: " + e
        );

        return true;
    }
}