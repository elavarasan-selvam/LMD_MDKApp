/* GetStopTime.js (safer read + clearer error reporting) */
export default function GetStopTime(context) {
   try {
       const binding = context.binding || {};
       // candidate time fields
       const candidates = [
           "PlannedStartDateTime","PlannedStart","StartDateTime","PlannedFrom","PlannedDateTime",
           "PlannedEndDateTime","EndDateTime","ScheduledStart","ScheduledEnd","PlannedTime","Time"
       ];
       function parseODataDate(val) {
           if (!val) return null;
           const s = val.toString();
           const m = /\/Date\((\d+)(?:[+-]\d+)?\)\//.exec(s);
           if (m && m[1]) return new Date(parseInt(m[1],10));
           const n = Number(s);
           if (!isNaN(n) && n > 0) return new Date(n);
           const iso = new Date(s);
           if (!isNaN(iso)) return iso;
           return null;
       }
       function formatTo12Hour(d) {
           if (!d) return "";
           let h = d.getHours();
           const mm = d.getMinutes().toString().padStart(2,"0");
           const ampm = h >= 12 ? "PM" : "AM";
           h = h % 12; if (h === 0) h = 12;
           return `${h}:${mm} ${ampm}`;
       }
       function tryKeysOn(obj) {
           if (!obj) return "";
           for (let k of candidates) {
               if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k]) {
                   const dt = parseODataDate(obj[k]);
                   if (dt) return formatTo12Hour(dt);
               }
           }
           return "";
       }
       // 1) direct on binding
       const direct = tryKeysOn(binding);
       if (direct) return direct;
       // 2) need address key to query stops
       const addrKey = binding.AddressNumber || binding.AddressID || binding.AddressId || binding.AddressKey;
       if (!addrKey) return "";
       // *** IMPORTANT: make sure this exactly matches the service string used in your page JSON ***
       const service = "/LMD_MDKApp/Services/DEST_SAMSMA_PPROP.service";
       const entity = "Stops";
       // Build OData filter safely:
       // - numeric keys are used as-is
       // - string keys are single-quoted, single quotes inside value doubled per OData spec
       // - we avoid injecting braces or placeholders here
       const isNumericKey = !isNaN(Number(addrKey));
       let filter;
       if (isNumericKey) {
           filter = `$filter=AddressId eq ${addrKey}&$orderby=PlannedStartDateTime asc&$top=1`;
       } else {
           // double any internal single quotes to escape inside OData literal
           const escaped = String(addrKey).replace(/'/g, "''");
           filter = `$filter=AddressID eq '${escaped}'&$orderby=PlannedStartDateTime asc&$top=1`;
       }
       // Perform read and return either the formatted time or a clear error string
       return context.read(service, entity, [], filter).then(result => {
           try {
               if (!result || result.length === 0) {
                   return ""; // no matching stops
               }
               const stop = (typeof result.getItem === "function") ? result.getItem(0) : result[0];
               const fromStop = tryKeysOn(stop);
               return fromStop || "";
           } catch (e) {
               // If parsing/structure fails, return an informative message (useful for debugging)
               return `read failed (parse): ${e && e.message ? e.message : String(e)}`;
           }
       }).catch(err => {
           // Return the error text so you can paste it back here
           const msg = err && err.message ? err.message : JSON.stringify(err);
           return `read failed: ${msg}`;
       });
   } catch (err) {
       return `rule error: ${err && err.message ? err.message : String(err)}`;
   }
}