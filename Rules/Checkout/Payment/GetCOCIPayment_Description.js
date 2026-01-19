/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function GetCOCIPayment_Description(context) {
    let isConfirmed = context.getAppClientData().COCIPaymentConfirmed;

    if (isConfirmed === true) {
        return "";  // done → empty description
    }
    return "Record and confirm the amount of cash you recieve for this stop.";  // open → show description
}
