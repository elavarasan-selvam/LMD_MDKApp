export default function InitSuccess_SaveTime(context) {

    const appData = context.getAppClientData();


    function formatDate(date) {

        const months = ["Jan","Feb","Mar","Apr","May","Jun",
                        "Jul","Aug","Sep","Oct","Nov","Dec"];

        const d = date.getDate();
        const m = months[date.getMonth()];
        const y = date.getFullYear();

        let h = date.getHours();
        const min = date.getMinutes().toString().padStart(2, '0');

        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;

        return `${m} ${d}, ${y} ${h}:${min} ${ampm}`;
    }


    // Save initialization time
    appData.LastSyncTime = formatDate(new Date());

    context.getPageProxy().redraw();

    return true;
}
