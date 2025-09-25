export default function GetLastChangeTimeStamp(context) {
    // Current date
    let now = new Date();

    // Convert to ISO string and remove the "Z" if service expects local time instead of UTC
    let isoString = now.toISOString().split('.')[0];  // "2024-11-06T10:45:07"
    //alert("LastChangeTimeStamp"+isoString);
    return isoString;
}
