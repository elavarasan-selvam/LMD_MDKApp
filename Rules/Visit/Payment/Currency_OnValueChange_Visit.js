// /Rules/Visit/Currency_OnValueChange_Visit.js
export default function Currency_OnValueChange_Visit(clientAPI) {

    const appData = clientAPI.getAppClientData();
   

    let currency = clientAPI.getValue(); // array from ListPicker
  

    // Extract from array
    if (Array.isArray(currency) && currency.length > 0) {
        currency = currency[0].ReturnedValue || currency[0].DisplayValue || "";
      
    } else {
      
        currency = "";
    }

    // Store only string for VISIT
    appData.Visit_Currency = currency;
  

    return true;
}
