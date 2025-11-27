export default async function GetStopInfoInsideVisit(context) {
   try {
       // Get Stop record from the binding
       const stop = context.binding;
       if (!stop) return "No stop data";
       // Use LocationAddressID directly from Stop record
       const locationAddressID = stop.LocationAddressID;
       if (!locationAddressID) return "No address ID";
       // Fetch CompleteAddress from BP service
       const addressResult = await context.read(
           '/LMD_MDKApp/Services/MD_BUSINESSPARTNER_SRV.service',
           'C_BPAddressValueHelp',
           [],
           `$filter=AddressNumber eq '${locationAddressID}'`
       );
       if (addressResult && addressResult.length > 0) {
           return addressResult.getItem(0).CompleteAddress || "Address not available";
       } else {
           return "Address not found";
       }
   } catch (error) {
       console.error("Error fetching address:", error);
       return "Error fetching address";
   }
}