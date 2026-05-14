export default async function GetDepositAccountReferences(context) {

    try {

        const result = await context.executeAction(
            "/LMD_MDKApp/Actions/BankDeposits/ReadDepositAccountReferences.action"
        );

        const data = result.data;

        //alert("Length: " + data.length);

        let pickerItems = [];

        for (let i = 0; i < data.length; i++) {

            let item = data.getItem(i);

            pickerItems.push({
                ReturnValue: item.DepositAccountReferenceID,
                DisplayValue: item.DepositAccountReferenceID
            });
        }

        return pickerItems;

    } catch (e) {

        alert(JSON.stringify(e));
        return [];
    }
}