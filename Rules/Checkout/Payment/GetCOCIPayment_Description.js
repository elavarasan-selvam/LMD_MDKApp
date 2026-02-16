export default function GetCOCIPayment_Description(context) {

    const appCD = context.getAppClientData();

    const stopUUID =
        (appCD.currentStop || context.binding)?.StopUUID;

    if (!stopUUID) {
        return "Record and confirm the amount of cash you receive for this stop.";
    }

    const isConfirmed =
        appCD.COCIPaymentConfirmedByStop?.[stopUUID] === true;

    return isConfirmed
        ? ""
        : "Record and confirm the amount of cash you receive for this stop.";
}
