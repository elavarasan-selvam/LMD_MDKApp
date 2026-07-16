import Checkout_Stop_Items_List from './TruckLoad/Checkout_Stop_Items_List';

/**
 * @param {IClientAPI} context
 */
export default async function GetItemCountText(context) {

    try {

        const finalList = await Checkout_Stop_Items_List(context);

        return `Items: ${finalList.length}`;

    } catch (e) {

        return "Items: 0";
    }
}