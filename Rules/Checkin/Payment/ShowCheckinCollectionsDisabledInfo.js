import ConfirmCollectionsButtonEnabling from './ConfirmCollectionsButtonEnabling';

export default async function ShowCheckinCollectionsDisabledInfo(context) {
    const buttonEnabled = await ConfirmCollectionsButtonEnabling(context);
    await context.getPageProxy().redraw();

    if (!buttonEnabled) {
        return context.executeAction(
            '/LMD_MDKApp/Actions/StartCheckin/Payment/CheckinCollectionsDisabledInfo.action'
        );
    }
}