export default function SetOrderedFlag(clientAPI) {
    const binding = clientAPI.getPageProxy().binding;

    // Get the value entered by user from the control
    const currentValue = clientAPI.getValue();

    // Store original OrderedQuantity if not already stored
    if (binding._OriginalOrderedQuantity === undefined) {
        binding._OriginalOrderedQuantity = binding.OrderedQuantity;
    }

    // Compare old vs new value
    const oldVal = String(binding._OriginalOrderedQuantity ?? "");
    const newVal = String(currentValue ?? "");

    // Set the flag: 1 if changed, 0 if unchanged
    binding._OrderedChanged = (oldVal !== newVal) ? 1 : 0;

    // Alert for debugging
    alert(`OrderedQuantity Change Detected:\nOldValue = ${oldVal}\nNewValue = ${newVal}\nFlag = ${binding._OrderedChanged}`);

    return true;
}
