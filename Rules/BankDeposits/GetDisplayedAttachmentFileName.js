/**
 * Returns fileName of first attachment in FormCell
 */
export default function GetDisplayedAttachmentFileName(context) {
 //   alert('GetDisplayedAttachmentFileName started');

    const attachments = context.evaluateTargetPath('#Control:FormCellAttachment0/#Value');
 //   alert(` Attachments value: ${JSON.stringify(attachments, null, 2)}`);

    if (!attachments || attachments.length === 0) {
        alert(' No attachments found');
        return '';
    }

    let fileName = '';

    if (attachments[0].urlStringWithFileName) {
        const urlWithName = attachments[0].urlStringWithFileName;
        fileName = urlWithName.substring(urlWithName.lastIndexOf('/') + 1);
     //   alert(` Extracted filename from URL: ${fileName}`);
    } else if (attachments[0].fileName) {
        fileName = attachments[0].fileName;
     //   alert(` Extracted filename from attachment object: ${fileName}`);
    } else {
     //   alert(' filename not available');
        return '';
    }

    return fileName;
}
