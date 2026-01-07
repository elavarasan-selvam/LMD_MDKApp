export default function GetProductDescription(context) {
    const productId = context.binding?.ProductID;
    if (!productId) return '';

    const appCD = context.getAppClientData();
    return appCD.ProductDescriptions?.[productId] || '';
}
