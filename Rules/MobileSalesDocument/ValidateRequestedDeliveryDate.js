export default function ValidateRequestedDeliveryDate(controlProxy) {

    const value = controlProxy.getValue();

    if (!value) {
        return true;
    }

    const selectedDate = new Date(value);
    const today = new Date();

    // Remove time from both dates
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Past date
    if (selectedDate < today) {

        // Clear the invalid date
        controlProxy.setValue('');

        controlProxy.setValidationProperty(
            'ValidationMessage',
            'Requested delivery date cannot be in the past.'
        );

        controlProxy.setValidationProperty(
            'ValidationViewIsHidden',
            false
        );

        controlProxy.applyValidation();

        return false;
    }

    // Today or future date
    controlProxy.setValidationProperty(
        'ValidationMessage',
        ''
    );

    controlProxy.setValidationProperty(
        'ValidationViewIsHidden',
        true
    );

    controlProxy.applyValidation();

    return true;
}