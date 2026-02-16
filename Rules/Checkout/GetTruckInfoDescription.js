export default function GetTruckInfoDescription(context) {

    const appCD = context.getAppClientData();

    const stopUUID =
        (appCD.currentStop || context.binding)?.StopUUID;

    if (!stopUUID) {
        return "Record the mileage of your truck.";
    }

    const isConfirmed =
        appCD.TruckInfoConfirmedByStop?.[stopUUID] === true;

    return isConfirmed ? "" : "Record the mileage of your truck.";
}
