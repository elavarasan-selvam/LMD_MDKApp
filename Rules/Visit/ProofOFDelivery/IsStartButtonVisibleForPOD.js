export default function IsStartButtonVisibleForPOD(context) {
    try {
        const appCD = context.getAppClientData();
        const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

        // If POD is confirmed → hide Start button
        if (stopUUID && appCD.PODConfirmedByStop?.[stopUUID] === true) {
            return false;
        }

        // POD not completed → show Start button
        return true;
    } catch (e) {
        context.getLogger().error(
            "IsStartButtonVisibleForPOD error: " + e
        );
        return true; // safe fallback: show button
    }
}
