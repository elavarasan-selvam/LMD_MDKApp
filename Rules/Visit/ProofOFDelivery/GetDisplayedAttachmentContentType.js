/**
 * Returns contentType of first attachment in FormCell
 */
export default function GetDisplayedAttachmentContentType(context) {
  //  alert('GetDisplayedAttachmentContentType started');

    const attachments = context.evaluateTargetPath('#Control:FormCellAttachment0/#Value');
   // alert(` Attachments value: ${JSON.stringify(attachments, null, 2)}`);

    if (!attachments || attachments.length === 0) {
     //   alert('⚠ No attachments found');
        return '';
    }

    let contentType = attachments[0].contentType;

    if (!contentType && attachments[0].nativeAttachment) {
        contentType = attachments[0].nativeAttachment.contentType || '';
       // alert(`⚠ Fallback contentType from nativeAttachment: ${contentType}`);
    }

    if (!contentType) {
       // alert('⚠ contentType not available');
        return '';
    }

   // alert(`Extracted contentType: ${contentType}`);
    return contentType;
}
