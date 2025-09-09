export default function OnReturnRefresh(context) {
    return context.getPageProxy().redraw();
}
