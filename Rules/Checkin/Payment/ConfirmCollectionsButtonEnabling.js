import CheckinSetAmountPaymentloaded from './CheckinSetAmountPaymentloaded';
import CheckTotalAmount_Loaded from './CheckTotalAmount_Loaded';

/**
 * "Confirm Collections" button enable rule (per stop).
 *
 * Bound to the `Enabled` property of the "Confirm Collections" toolbar button
 * on the `CheckIn_Cash_Check_Payments` page.
 *
 * IMPORTANT: This is a PURE boolean evaluator. It must NOT execute payment-save
 * actions - running save actions inside an `Enabled` binding is unsafe (the
 * rule re-runs on every re-evaluation, creating duplicate payments) and was the
 * root cause of the button being permanently enabled.
 *
 * Payments are persisted by the individual payment pages' Save buttons:
 *   - Payment.page              -> COCIPayment_Checkin.action   (Cash / CA)
 *   - CheckIn_CheckPayment.page -> COCI_CheckPayment.action     (Check / CH)
 *
 * Button state:
 *   ENABLED  -> every positive cash/check amount has been SAVED to the backend
 *               AND the collections for this stop have NOT yet been confirmed.
 *               A zero cash/check amount does not require a save.
 *   DISABLED -> no valid context, OR already confirmed, OR a positive amount
 *               was entered but not saved (user must tap the payment page Save).
 *
 * @param {IClientAPI} context
 */
export default async function ConfirmCollectionsButtonEnabling(context) {
    try {
        const appData = context.getAppClientData();
        const binding = context.binding || appData.currentStop;

        const routeUUID = binding ? binding.RouteUUID : undefined;
        const currentStop = appData.currentStop || binding;
        const stopUUID = currentStop ? currentStop.StopUUID : undefined;

        // 1. No valid collection context -> keep disabled
        if (!routeUUID || !stopUUID) {
            return false;
        }

        // 2. Already confirmed for this stop -> keep disabled (no re-confirm)
        if (
            appData.CheckinCOCIPaymentConfirmedByStop &&
            appData.CheckinCOCIPaymentConfirmedByStop[stopUUID] === true
        ) {
            return false;
        }

        // 3. Read the amounts currently shown on the two payment pages. Values
        //    changed by the user are kept in app data; otherwise use the loaded
        //    amount rules so route amounts are also checked.
        const cashAmount = appData.Checkin_Amount !== undefined
            ? Number(appData.Checkin_Amount || 0)
            : Number(await CheckinSetAmountPaymentloaded(context) || 0);
        const checkAmount = appData.Check_Amount !== undefined
            ? Number(appData.Check_Amount || 0)
            : Number(await CheckTotalAmount_Loaded(context) || 0);

        // 4. Check whether the current cash/check amounts have already been
        //    SAVED to the backend for this stop's CHECKIN stop.
        let hasCashInBackend = false;
        let hasCheckInBackend = false;

        try {
            const service = "/LMD_MDKApp/Services/LMD_MA.service";

            const checkinStops = await context.read(
                service,
                "Stops",
                [],
                `$filter=RouteUUID eq guid'${routeUUID}' and StopType eq 'CHECKIN'`
            );

            if (checkinStops.length > 0) {
                const checkinStopUUID = checkinStops.getItem(0).StopUUID;

                const cashPayments = await context.read(
                    service,
                    "COCIPayments",
                    [],
                    `$filter=StopUUID eq guid'${checkinStopUUID}' and PaymentType eq 'CA'`
                );
                hasCashInBackend = Array.from({ length: cashPayments.length }).some(
                    (_, index) => Number(cashPayments.getItem(index).Amount || 0) === cashAmount
                );

                const checkPayments = await context.read(
                    service,
                    "COCIPayments",
                    [],
                    `$filter=StopUUID eq guid'${checkinStopUUID}' and PaymentType eq 'CH'`
                );
                hasCheckInBackend = Array.from({ length: checkPayments.length }).some(
                    (_, index) => Number(checkPayments.getItem(index).Amount || 0) === checkAmount
                );
            }
        } catch (readErr) {
            if (context.getLogger) {
                context.getLogger().error(
                    "ConfirmCollectionsButtonEnabling backend check error: "
                        + readErr.message
                );
            }
        }

        // 5. Each positive amount must have a matching saved payment. Zero or
        //    negative amounts explicitly do not require a payment save.
        const cashIsReady = cashAmount <= 0 || hasCashInBackend;
        const checkIsReady = checkAmount <= 0 || hasCheckInBackend;
        return cashIsReady && checkIsReady;

    } catch (e) {
        if (context.getLogger) {
            context.getLogger().error(
                "ConfirmCollectionsButtonEnabling error: "
                    + (e && e.message ? e.message : e)
            );
        }
        return false;
    }
}
