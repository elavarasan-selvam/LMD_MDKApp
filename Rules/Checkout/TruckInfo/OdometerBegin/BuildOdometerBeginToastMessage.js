export default function BuildOdometerBeginToastMessage(clientAPI) {

    const appData = clientAPI.getAppClientData();

    const value = appData.OdometerBeginValue;

    if (value) {
        return "Odometer Begin updated to " + value;
    }

    return "Odometer Begin value updated successfully";
}
