export default function CheckinDebugPaymentType(clientAPI) {
   const appData = clientAPI.getAppClientData();

    const paymentType = appData.Checkin_PaymentType || '';
    const currency = appData.Checkin_Currency || '';
    const amount = appData.Checkin_Amount || '';

    // Show all three values in an alert on page load
    alert(
        "Page Load Debug:\n" +
        "PaymentType: " + paymentType + "\n" +
        "Currency: " + currency + "\n" +
        "Amount: " + amount
    );

    return true; // always return boolean for onPageLoad
}