/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */

export default function getDocumentID(context){

const DocID = context.getPageProxy().getClientData().DocumentID;

return DocID;
}
