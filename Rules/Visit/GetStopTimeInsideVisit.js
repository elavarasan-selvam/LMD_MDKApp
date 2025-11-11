/* GetStopTime.js — show start and end time for VISIT */
export default function GetStopTime(context) {
    try {
        const binding = context.binding || {};

        // Only show for VISIT stop type
        if (binding.StopType && binding.StopType !== 'VISIT') {
            return ''; 
        }

        // Candidate time fields
        const startCandidates = [
            "PlannedStartDateTime","PlannedStart","StartDateTime","PlannedFrom","PlannedDateTime","ScheduledStart"
        ];
        const endCandidates = [
            "PlannedEndDateTime","EndDateTime","ScheduledEnd","PlannedTo"
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

        function findTime(obj, keys) {
            for (let k of keys) {
                if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k]) {
                    const dt = parseODataDate(obj[k]);
                    if (dt) return dt;
                }
            }
            return null;
        }

        // Try to get from binding directly
        const startDate = findTime(binding, startCandidates);
        const endDate = findTime(binding, endCandidates);
        if (startDate || endDate) {
            const startText = formatTo12Hour(startDate);
            const endText = formatTo12Hour(endDate);
            return endText ? `${startText} - ${endText}` : startText;
        }

        // Fallback: fetch from backend if binding doesn't contain time
        const addrKey = binding.AddressNumber || binding.AddressID || binding.AddressId || binding.AddressKey;
        if (!addrKey) return "";

        const service = "/LMD_MDKApp/Services/DEST_SAMLMD_PPROP.service";
        const entity = "Stops";
        const isNumericKey = !isNaN(Number(addrKey));
        let filter;

        if (isNumericKey) {
            filter = `$filter=AddressId eq ${addrKey} and StopType eq 'VISIT'&$orderby=PlannedStartDateTime asc&$top=1`;
        } else {
            const escaped = String(addrKey).replace(/'/g, "''");
            filter = `$filter=AddressID eq '${escaped}' and StopType eq 'VISIT'&$orderby=PlannedStartDateTime asc&$top=1`;
        }

        return context.read(service, entity, [], filter).then(result => {
            if (!result || result.length === 0) return "";
            const stop = (typeof result.getItem === "function") ? result.getItem(0) : result[0];

            const startDate2 = findTime(stop, startCandidates);
            const endDate2 = findTime(stop, endCandidates);
            const startText2 = formatTo12Hour(startDate2);
            const endText2 = formatTo12Hour(endDate2);
            return endText2 ? `${startText2} - ${endText2}` : startText2;
        }).catch(() => "");
    } catch (err) {
        return "";
    }
}
