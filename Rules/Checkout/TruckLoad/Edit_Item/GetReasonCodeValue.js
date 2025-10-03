// Rules/GetReasonCode.js
export default function GetReasonCode(clientAPI) {
    let value = clientAPI.evaluateTargetPath("#Control:ReasonCodePicker/#Value");

    if (Array.isArray(value) && value.length > 0) {
        let first = value[0];

        // If it's an object (PickerItem), take ReturnValue
        if (typeof first === 'object' && first.ReturnValue) {
            return first.ReturnValue;  // string "DC"
        }

        // If it's already a string
        return first;
    }

    return "";  // fallback to empty string
}
