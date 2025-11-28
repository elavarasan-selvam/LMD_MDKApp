export default function DebugPaymentType(clientAPI) {
   const appData = clientAPI.getAppClientData();

    const paymentType = appData.Checkout_PaymentType || '';
    const currency = appData.Checkout_Currency || '';
    const amount = appData.Checkout_Amount || '';

    // Show all three values in an alert on page load
    alert(
        "Page Load Debug:\n" +
        "PaymentType: " + paymentType + "\n" +
        "Currency: " + currency + "\n" +
        "Amount: " + amount
    );

    return true; // always return boolean for onPageLoad
}