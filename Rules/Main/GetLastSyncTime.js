export default function GetLastSyncTime(context) {

    const appData = context.getAppClientData();

    return appData.LastSyncTime
        ? '                 Last Sync : ' + appData.LastSyncTime
        : 'Last Sync : --';
}
