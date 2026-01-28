export default function ResetTruckLoadFlags(context) {
    const appCD = context.getAppClientData();
    delete appCD._truckPrefetchStarted;
    delete appCD.TruckLoadDescriptions;
}
