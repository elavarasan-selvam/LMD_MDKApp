export default function GetTruckLoadDescription(context) {

    const appCD = context.getAppClientData();

    const stopUUID =
        (appCD.currentStop || context.binding)?.StopUUID;

    if (!stopUUID) {
        return "Check and confirm your truck load.";
    }

    const isConfirmed =
        appCD.TruckLoadConfirmedByStop?.[stopUUID] === true;

    return isConfirmed ? "" : "Check and confirm your truck load.";
}
