export default function SetLastSyncAfterSync(context) {
   try {
       // Build deterministic format: "Sep 25 2025 02:06 AM"
       const now = new Date();
       const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
       const month = months[now.getMonth()];
       const day = now.getDate();
       const year = now.getFullYear();
       let hours = now.getHours(); // 0-23
       const minutes = now.getMinutes();
       const ampm = hours >= 12 ? 'PM' : 'AM';
       hours = hours % 12;
       if (hours === 0) hours = 12;
       const hourStr = hours < 10 ? '0' + hours : '' + hours;
       const minStr = minutes < 10 ? '0' + minutes : '' + minutes;
       const formatted = `${month} ${day} ${year} ${hourStr}:${minStr} ${ampm}`;
       // Save into Application.clientData so the UI can read it
       const pageProxy = context.getPageProxy ? context.getPageProxy() : null;
       const app = pageProxy && pageProxy.getApplication ? pageProxy.getApplication() :
                   (context.getApplication ? context.getApplication() : null);
       if (app && app.getClientData) {
           app.getClientData().LastSync = formatted;
       } else if (context.getClientData) {
           context.getClientData().LastSync = formatted;
       }
       // Return formatted string (useful if this rule is executed directly)
       return `               Last Sync : ${formatted}` ;
   } catch (e) {
       return false;
   }
}