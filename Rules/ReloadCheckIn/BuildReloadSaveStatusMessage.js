/**
 * BuildReloadSaveStatusMessage.js
 *
 * Creates the popup message after Save.
 *
 * @param {IClientAPI} clientAPI
 */
export default function BuildReloadSaveStatusMessage(clientAPI) {

    const appData = clientAPI.getAppClientData();

    const savedCount =
        appData.ReloadSavedProductList
            ? appData.ReloadSavedProductList.length
            : 0;

    const totalCount =
        appData.ReloadTotalProductCount || 0;

    // =====================================================
    // ALL PRODUCTS SAVED + COCI MATCHED
    // =====================================================

    if (
        appData.ReloadSaveStatus === "MATCHED"
    ) {

        return (
            "All products saved, Enabled CheckIn\n\n" +
            "All products matched with COCI.\n\n" +
            "Confirm Reload CheckIn is ENABLED."
        );
    }

    // =====================================================
    // ALL PRODUCTS SAVED BUT COCI DID NOT MATCH
    // =====================================================

    if (
        appData.ReloadSaveStatus === "COCI_FAILED"
    ) {

        return (
            "All products saved, Enabled CheckIn\n\n" +
            "COCI product matching failed.\n\n" +
            "Confirm Reload CheckIn remains DISABLED."
        );
    }

    // =====================================================
    // PRODUCTS ARE STILL BEING SAVED
    // =====================================================

    return (
        "Product saved successfully, Complete all products for enabled CheckIn\n\n" +
        "Completed: " +
        savedCount +
        " / " +
        totalCount +
        " products.\n\n" +
        "Complete all products to enable Confirm Reload CheckIn."
    );
}