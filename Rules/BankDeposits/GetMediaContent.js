export default function GetContentMedia(context) {
    const props = context.getPageProxy().getClientData().attachmentProps;

    if (props && props.attachment && props.attachment.length > 0) {
      //  alert('Media found, sending to backend');
        return props.attachment;
    }

  //  alert(' No media found in state variable');
    return [];
}
