export default function GetItemCountText(context) {
    const appData = context.getAppClientData();
    const count = appData.PendingCount || 0;
    return `Items: ${count}`;
}


