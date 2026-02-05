export default function OnReturnRefresh(context) {
    context.getPageProxy().redraw();
    return true;
}
