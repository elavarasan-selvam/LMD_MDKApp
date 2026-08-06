export default function GetMobileSalesDocumentStatus(context) {

    const appCD = context.getAppClientData();
    const stopUUID = (appCD.currentStop || context.binding)?.StopUUID;

    if (stopUUID && appCD.MobileSalesDocumentByStop?.[stopUUID]) {
        return "Done";
    }

    return "Open";
}