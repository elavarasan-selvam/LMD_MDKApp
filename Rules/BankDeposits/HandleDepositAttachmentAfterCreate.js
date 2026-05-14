export default async function HandleDepositAttachmentAfterCreate(context) {

    const appCD =
        context.getAppClientData();

    const hasAttachment =
        appCD.hasDepositAttachment;

    // =========================================
    // NO ATTACHMENT
    // =========================================

    if (!hasAttachment) {

        // reset flag
        appCD.hasDepositAttachment = false;

        return context.executeAction(
            '/LMD_MDKApp/Actions/BankDeposits/NavBackToMain.action'
        );
    }

    // =========================================
    // ATTACHMENT EXISTS
    // =========================================

    // reset flag before create
    appCD.hasDepositAttachment = false;

    return context.executeAction(
        '/LMD_MDKApp/Actions/BankDeposits/CreateActionForAttachment.action'
    );
}