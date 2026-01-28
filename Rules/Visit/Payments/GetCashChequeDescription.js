export default function GetCashChequeDescription(context) {
    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    // If POD is completed → hide description
    if (stopUUID && appCD.CollectionPaymentConfirmed?.[stopUUID] === true) {
        return "";
    }

    // If POD is open → show description
    return "Record and confirm the amount of Cash/Cheque you receive for this stop. ";
}


 