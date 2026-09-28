/**
 * ValidateReloadProductsAfterSave.js
 *
 * Validates:
 *
 * 1. All reload products are saved
 * 2. Reload_CI Stop exists
 * 3. COCIProducts.StopUUID matches RELOAD_CI StopUUID
 * 4. Every reload ProductID exists in COCIProducts
 *
 * Result:
 *
 * MATCHED
 *     -> Confirm Reload CheckIn ENABLED
 *
 * PARTIAL
 *     -> Confirm Reload CheckIn DISABLED
 *
 * COCI_FAILED
 *     -> Confirm Reload CheckIn DISABLED
 *
 * ERROR
 *     -> Confirm Reload CheckIn DISABLED
 */

export default async function ValidateReloadProductsAfterSave(clientAPI) {

    const appData = clientAPI.getAppClientData();

    // =====================================================
    // ALWAYS START DISABLED
    // =====================================================

    appData.IsReloadCheckInConfirmEnabled = false;

    try {

        // =================================================
        // 1. INITIALIZE SAVED PRODUCT LIST
        // =================================================

        if (!Array.isArray(appData.ReloadSavedProductList)) {
            appData.ReloadSavedProductList = [];
        }

        // =================================================
        // 2. GET PAGE PROXY
        // =================================================

        const pageProxy = clientAPI.getPageProxy();

        const binding = pageProxy.binding || {};

        // =================================================
        // 3. GET CURRENT PRODUCT ID
        // =================================================

        const currentProductId =
            binding.ProductID ||
            binding.productID ||
            binding.ProductId;

        if (
            currentProductId === undefined ||
            currentProductId === null ||
            String(currentProductId).trim() === ""
        ) {

            appData.ReloadSaveStatus = "ERROR";

            return false;
        }

        // =================================================
        // 4. NORMALIZE CURRENT PRODUCT
        // =================================================

        const normalizedCurrentProductId =
            String(currentProductId)
                .trim()
                .toUpperCase();

        // =================================================
        // 5. ADD CURRENT PRODUCT TO SAVED LIST
        // =================================================

        if (
            !appData.ReloadSavedProductList.includes(
                normalizedCurrentProductId
            )
        ) {

            appData.ReloadSavedProductList.push(
                normalizedCurrentProductId
            );
        }

        // =================================================
        // 6. GET ALL RELOAD PRODUCTS
        // =================================================

        const reloadProducts =
            appData.ReloadPendingProductList || [];

        if (
            !Array.isArray(reloadProducts) ||
            reloadProducts.length === 0
        ) {

            appData.ReloadSaveStatus = "ERROR";

            return false;
        }

        // =================================================
        // 7. CREATE UNIQUE RELOAD PRODUCT LIST
        // =================================================

        const reloadProductIds = [];

        for (let i = 0; i < reloadProducts.length; i++) {

            const item = reloadProducts[i];

            let productId;

            if (
                item !== null &&
                typeof item === "object"
            ) {

                productId =
                    item.ProductID ||
                    item.productID ||
                    item.ProductId;

            } else {

                productId = item;
            }

            if (
                productId !== undefined &&
                productId !== null &&
                String(productId).trim() !== ""
            ) {

                const normalizedProductId =
                    String(productId)
                        .trim()
                        .toUpperCase();

                if (
                    !reloadProductIds.includes(
                        normalizedProductId
                    )
                ) {

                    reloadProductIds.push(
                        normalizedProductId
                    );
                }
            }
        }

        // =================================================
        // 8. STORE TOTAL PRODUCT COUNT
        // =================================================

        appData.ReloadTotalProductCount =
            reloadProductIds.length;

        // =================================================
        // 9. CHECK ALL PRODUCTS SAVED
        // =================================================

        const allProductsSaved =
            reloadProductIds.length > 0 &&
            reloadProductIds.every(function (productId) {

                return appData.ReloadSavedProductList.includes(
                    productId
                );

            });

        // =================================================
        // 10. NOT ALL PRODUCTS SAVED
        // =================================================

        if (!allProductsSaved) {

            appData.IsReloadCheckInConfirmEnabled = false;

            appData.ReloadSaveStatus = "PARTIAL";

            return false;
        }

        // =================================================
        // 11. ALL PRODUCTS SAVED
        // NOW CHECK RELOAD_CI STOP
        // =================================================

        const reloadStops =
            await pageProxy.read(
                "/LMD_MDKApp/Services/LMD_MA.service",
                "Stops",
                [],
                "$filter=StopType eq 'RELOAD_CI'"
            );

        if (
            !reloadStops ||
            reloadStops.length === 0
        ) {

            appData.IsReloadCheckInConfirmEnabled = false;

            appData.ReloadSaveStatus = "COCI_FAILED";

            return false;
        }

        // =================================================
        // 12. GET RELOAD_CI STOP UUID
        // =================================================

        const reloadStopUUIDs = [];

        for (let i = 0; i < reloadStops.length; i++) {

            const stop = reloadStops.getItem(i);

            const stopUUID =
                stop.StopUUID ||
                stop.StopUuid ||
                stop.stopUUID;

            if (
                stopUUID !== undefined &&
                stopUUID !== null &&
                String(stopUUID).trim() !== ""
            ) {

                const normalizedStopUUID =
                    String(stopUUID)
                        .trim()
                        .toUpperCase();

                if (
                    !reloadStopUUIDs.includes(
                        normalizedStopUUID
                    )
                ) {

                    reloadStopUUIDs.push(
                        normalizedStopUUID
                    );
                }
            }
        }

        // =================================================
        // 13. NO RELOAD_CI STOP FOUND
        // =================================================

        if (reloadStopUUIDs.length === 0) {

            appData.IsReloadCheckInConfirmEnabled = false;

            appData.ReloadSaveStatus = "COCI_FAILED";

            return false;
        }

        // =================================================
        // 14. READ COCI PRODUCTS
        // =================================================

        const cociProducts =
            await pageProxy.read(
                "/LMD_MDKApp/Services/LMD_MA.service",
                "COCIProducts",
                [],
                ""
            );

        if (
            !cociProducts ||
            cociProducts.length === 0
        ) {

            appData.IsReloadCheckInConfirmEnabled = false;

            appData.ReloadSaveStatus = "COCI_FAILED";

            return false;
        }

        // =================================================
        // 15. GET COCI PRODUCTS FOR RELOAD_CI STOP
        // =================================================

        const cociProductIds = [];

        for (let i = 0; i < cociProducts.length; i++) {

            const cociProduct =
                cociProducts.getItem(i);

            const cociProductId =
                cociProduct.ProductID ||
                cociProduct.productID ||
                cociProduct.ProductId;

            const cociStopUUID =
                cociProduct.StopUUID ||
                cociProduct.StopUuid ||
                cociProduct.stopUUID;

            if (
                cociProductId === undefined ||
                cociProductId === null ||
                String(cociProductId).trim() === ""
            ) {
                continue;
            }

            if (
                cociStopUUID === undefined ||
                cociStopUUID === null ||
                String(cociStopUUID).trim() === ""
            ) {
                continue;
            }

            const normalizedCOCIStopUUID =
                String(cociStopUUID)
                    .trim()
                    .toUpperCase();

            // =============================================
            // COCI StopUUID MUST MATCH RELOAD_CI StopUUID
            // =============================================

            if (
                !reloadStopUUIDs.includes(
                    normalizedCOCIStopUUID
                )
            ) {
                continue;
            }

            const normalizedCOCIProductId =
                String(cociProductId)
                    .trim()
                    .toUpperCase();

            if (
                !cociProductIds.includes(
                    normalizedCOCIProductId
                )
            ) {

                cociProductIds.push(
                    normalizedCOCIProductId
                );
            }
        }

        // =================================================
        // 16. COMPARE EVERY RELOAD PRODUCT WITH COCI
        // =================================================

        const unmatchedProducts = [];

        for (
            let i = 0;
            i < reloadProductIds.length;
            i++
        ) {

            const reloadProductId =
                reloadProductIds[i];

            if (
                !cociProductIds.includes(
                    reloadProductId
                )
            ) {

                unmatchedProducts.push(
                    reloadProductId
                );
            }
        }

        // =================================================
        // 17. FINAL MATCH RESULT
        // =================================================

        const allProductsMatched =
            reloadProductIds.length > 0 &&
            unmatchedProducts.length === 0;

        // =================================================
        // 18. ALL PRODUCTS MATCHED
        // =================================================

        if (allProductsMatched) {

            appData.IsReloadCheckInConfirmEnabled = true;

            appData.ReloadSaveStatus = "MATCHED";

            return true;
        }

        // =================================================
        // 19. COCI MATCH FAILED
        // =================================================

        appData.IsReloadCheckInConfirmEnabled = false;

        appData.ReloadSaveStatus = "COCI_FAILED";

        return false;

    } catch (error) {

        // =================================================
        // ERROR
        // =================================================

        appData.IsReloadCheckInConfirmEnabled = false;

        appData.ReloadSaveStatus = "ERROR";

        return false;
   } finally {
 
        await clientAPI.executeAction(
            "/LMD_MDKApp/Actions/StartCheckin/Payment/ActualandUnloadedUpdationMessage.action"
        );
    }
}