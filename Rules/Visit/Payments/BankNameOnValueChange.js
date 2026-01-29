// /Rules/Visit/BankName_OnValueChange_Visit.js
export default function BankName_OnValueChange_Visit(clientAPI) {

    const appData = clientAPI.getAppClientData();

    let bank = clientAPI.getValue(); // array from ListPicker

    // Extract from array
    if (Array.isArray(bank) && bank.length > 0) {
        bank = bank[0].ReturnValue || bank[0].DisplayValue || "";
    } else {
        bank = "";
    }

    // Store only string
    appData.Visit_BankName = bank;

    return true;
}
