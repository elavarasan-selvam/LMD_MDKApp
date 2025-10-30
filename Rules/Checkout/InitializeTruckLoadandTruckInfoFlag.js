export default function InitializeTruckLoadandTruckInfoFlag(context) {
    const appCD = context.getAppClientData();

    // 1️⃣ Initialize TruckLoad and TruckInfo flags
    if (appCD.TruckLoadConfirmed === undefined) {
        appCD.TruckLoadConfirmed = false;
    }
    if (appCD.TruckInfoConfirmed === undefined) {
        appCD.TruckInfoConfirmed = false;
    }

    // 2️⃣ Store Stop reference for later use in Complete Checkout
    if (!appCD.currentStop && context.binding) {
        appCD.currentStop = context.binding; // store Stop entity
        console.log('Stop reference stored: ' + context.binding.StopID);
    }

    return true;
}
