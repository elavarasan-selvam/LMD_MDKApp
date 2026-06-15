/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default async function UnplannedReturnSalesOrganization(context) {
 
const DelType = "ZCR1";
const MobiledocType = "RET";
const service = '/LMD_MDKApp/Services/LMD_MA.service';
const list = await context.read(
            service,
            'MobileDocumentTypes',
            [],
            `$filter=DeliveryType eq '${DelType}' and MobileDocumentType eq '${MobiledocType}'`
        );
if (!list || list.length === 0) {
            return '';
        }
const distributionChannel = list.getItem(0).DistributionChannel;
//alert("Distribution Channel: " + distributionChannel);
return distributionChannel;  
}