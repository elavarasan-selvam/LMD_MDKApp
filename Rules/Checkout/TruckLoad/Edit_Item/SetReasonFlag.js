export default function SetReasonFlag(clientAPI) {
    let binding = clientAPI.getPageProxy().binding;

    let currentValue = clientAPI.getValue();

    if (Array.isArray(currentValue) && currentValue.length > 0) {
        binding._ReasonCodeSelected = 1;
        binding.ReasonCode = currentValue[0];   // store actual code
    } else {
        binding._ReasonCodeSelected = 0;
        binding.ReasonCode = "";
    }

    //alert(`ReasonCodeChanged → Flag=${binding._ReasonCodeSelected}, Value=${JSON.stringify(currentValue)}, StoredReasonCode=${binding.ReasonCode}`);
    return true;
}
