export default function GetPaymentTypeString(clientAPI) {
    const pickerValue = clientAPI.evaluateTargetPath(
        '#Page:Payment/#Control:SectionedTable0/#Section:SectionFormCell0/#Control:PaymentTypeInput/#Value'
    );

    // Debug: see what we received
    //alert("Raw pickerValue: " + JSON.stringify(pickerValue));

    let finalValue = '';

    // Always return a single string of max 2 characters
    if (Array.isArray(pickerValue)) {
        finalValue = pickerValue[0] || ''; // CA
        //alert("Array detected. Using first element: " + finalValue);
    } else if (typeof pickerValue === 'string') {
        finalValue = pickerValue.substring(0, 2); // truncate to 2 chars
        //alert("String detected. Truncated to 2 chars: " + finalValue);
    } else {
        finalValue = '';
        //alert("Neither array nor string. Returning blank.");
    }

    return finalValue;
}
