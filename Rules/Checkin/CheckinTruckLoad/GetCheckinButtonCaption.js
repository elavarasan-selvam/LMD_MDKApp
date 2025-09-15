export default function GetCheckinButtonCaption(context) {
    return context.getAppClientData().StartButton ? "Start" : "Confirm";
}
