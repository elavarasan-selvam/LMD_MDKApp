export default function ResetReturnFlags(context) {
    const appCD = context.getAppClientData();
    delete appCD._returnPrefetchStarted;
    delete appCD._returnReady;
    delete appCD.ReturnDescriptions;
}
