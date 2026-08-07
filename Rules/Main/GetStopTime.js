/* GetStopTime.js - Visit shows both times; Checkin/Checkout only start time (fallback end if missing) */
export default function GetStopTime(context) {
    try {
        const binding = context.binding || {};

        // Candidate field names for start and end times
        const startKeys = [
            "PlannedStartDateTime",
            "PlannedStart",
            "StartDateTime",
            "PlannedFrom",
            "ScheduledStart",
            "PlannedTime"
        ];
        const endKeys = [
            "PlannedEndDateTime",
            "EndDateTime",
            "PlannedTo",
            "ScheduledEnd",
            "PlannedEndTime"
        ];

        // Parse OData date strings or timestamps
        function parseODataDate(val) {
            if (!val) return null;
            const s = val.toString();
            const m = /\/Date\((\d+)(?:[+-]\d+)?\)\//.exec(s);
            if (m && m[1]) return new Date(parseInt(m[1], 10));
            const n = Number(s);
            if (!isNaN(n) && n > 0) return new Date(n);
            const iso = new Date(s);
            if (!isNaN(iso)) return iso;
            return null;
        }

        // Format date into 12-hour AM/PM time string
        function formatTo12Hour(d) {
            if (!d) return "";
            let h = d.getHours();
            const mm = d.getMinutes().toString().padStart(2, "0");
            const ampm = h >= 12 ? "PM" : "AM";
            h = h % 12;
            if (h === 0) h = 12;
            return `${h}:${mm} ${ampm}`;
        }

        // Find and return the first available valid date field
        function findDate(obj, keys) {
            for (let k of keys) {
                if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k]) {
                    const dt = parseODataDate(obj[k]);
                    if (dt) return dt;
                }
            }
            return null;
        }

        // Format start/end times based on stop type
        function formatStartEnd(obj) {
            const start = findDate(obj, startKeys);
            const end = findDate(obj, endKeys);
            const stopType = (obj.StopType || "").toUpperCase();

            if (stopType === "VISIT") {
                if (start && end) return `${formatTo12Hour(start)} - ${formatTo12Hour(end)}`;
                if (start) return formatTo12Hour(start);
                if (end) return formatTo12Hour(end);
                return "";
            }

            // For CHECKIN / CHECKOUT — show start or fallback to end
            if (stopType === "CHECKIN" || stopType === "CHECKOUT") {
                if (start) return formatTo12Hour(start);
                if (end) return formatTo12Hour(end);
                return "";
            }

            return start ? formatTo12Hour(start) : "";
        }
        
        // RELOAD_CI / RELOAD_CO - Display LocationID instead of time
        const stopType = (binding.StopType || "").toUpperCase();

        if (stopType === "RELOAD_CI" || stopType === "RELOAD_CO") {
        return `LocationID : ${binding.LocationID || ""}`;
        }

        // Try direct binding first
        const direct = formatStartEnd(binding);
        if (direct) return direct;

        // Get address key from binding
        const addrKey =
            binding.AddressNumber ||
            binding.AddressID ||
            binding.AddressId ||
            binding.AddressKey;

        if (!addrKey) return "";

        const service = "/LMD_MDKApp/Services/LMD_MA.service";
        const entity = "Stops";

        // Use AddressNumber for filter (common field in Stops)
        const escaped = String(addrKey).replace(/'/g, "''");
        const filter = `$filter=AddressNumber eq '${escaped}'&$orderby=PlannedStartDateTime asc&$top=1`;

        // Perform read operation
        return context
            .read(service, entity, [], filter)
            .then(result => {
                if (!result || result.length === 0) return "";
                const stop =
                    typeof result.getItem === "function"
                        ? result.getItem(0)
                        : result[0];
                return formatStartEnd(stop);
            })
            .catch(err => {
                const msg = err && err.message ? err.message : JSON.stringify(err);
                return `read failed: ${msg}`;
            });
    } catch (err) {
        return `rule error: ${err && err.message ? err.message : String(err)}`;
    }
}
