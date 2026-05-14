export default function CaptureAttachment(context) {
  //  alert('CaptureAttachment triggered');

    const attachments = context.evaluateTargetPath(
        '#Control:FormCellAttachment0/#Value'
    );
    context.getAppClientData().hasDepositAttachment = false;
    if (!attachments || attachments.length === 0) {
    //    alert('No attachment in control');
        return;
    }

    const mediaArray = attachments.map(a => ({
        content: a.content,          // Base64 / binary
        contentType: a.contentType,  // image/jpeg
        fileName: a.fileName         // photo.jpg
    }));

    context.getPageProxy().getClientData().attachmentProps = {
        attachment: mediaArray,
        FileName: mediaArray[0].fileName
    };
    context.getAppClientData().hasDepositAttachment = true;
 //   alert('Attachment stored in state variable');
}
