export default function GetMobileSalesDocumentDescription(context) {

    const appCD = context.getAppClientData();

    const stopUUID =
        (appCD.currentStop || context.binding)?.StopUUID;

    // If Mobile Sales Document is completed → hide description
    if (
        stopUUID &&
        appCD.MobileSalesDocumentByStop?.[stopUUID] === true
    ) {
        return "";
    }

    // If open → show description
    return "Create sales order for customer.";
}