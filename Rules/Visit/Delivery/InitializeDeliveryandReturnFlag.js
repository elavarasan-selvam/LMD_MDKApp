export default async function InitializeDeliveryandReturnFlag(context) {
    const appCD = context.getAppClientData();

    // Global flags
    if (appCD.TruckDeliveryConfirmed === undefined) {
        appCD.TruckDeliveryConfirmed = false;
    }
    if (appCD.TruckReturnConfirmed === undefined) {
        appCD.TruckReturnConfirmed = false;
    }

    // Per-stop maps (MUST exist)
    if (!appCD.ReturnConfirmedByStop) {
        appCD.ReturnConfirmedByStop = {};
    }

    if (!appCD.DeliveryConfirmedByStop) {
        appCD.DeliveryConfirmedByStop = {};
    }
    if (!appCD.PODConfirmedByStop) {
        appCD.PODConfirmedByStop = {};
    }
    if (!appCD.CollectionPaymentConfirmed) {
        appCD.CollectionPaymentConfirmed = {};
    }

     if (!appCD.MobileSalesDocumentByStop) {
        appCD.MobileSalesDocumentByStop = {};
    }

    // Set currentStop correctly
    const binding = context.binding;
    if (binding?.StopUUID) {
        appCD.currentStop = binding;
    }

    context.getPageProxy().redraw();
    return true;
}
