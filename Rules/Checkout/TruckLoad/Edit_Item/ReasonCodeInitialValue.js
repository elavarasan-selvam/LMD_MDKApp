export default function ReasonCodeInitialValue(clientAPI) {
    let binding = clientAPI.binding;
    if (binding.ReasonCode) {
        //alert("rc"+[binding.ReasonCode]);
        return [binding.ReasonCode];  // wrap in array
    }
    return [];
}
