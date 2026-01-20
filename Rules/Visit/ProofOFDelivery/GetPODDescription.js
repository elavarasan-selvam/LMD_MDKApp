export default function GetPODDescription(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    // If POD is completed → hide description
    if (stopUUID && appCD.PODConfirmedByStop?.[stopUUID] === true) {
        return "";
    }

    // If POD is open → show description
    return "Acknowledgement of Delivery. ";
}
