export default function GetCheckinItemCountText(context) {
    let binding = context.binding;
    let service = "/LMD_MDKApp/Services/DEST_SAMLMD_PPROP.service";

    return context.read(
        service,
        "DocumentItems",
        [],
        `$apply=filter(DocumentUUID eq guid'${binding.DocumentUUID}')/aggregate(DocumentItemUUID with countdistinct as ItemCount)`
    ).then(result => {
        let count = 0;
        if (result && result.length > 0) {
            count = result.getItem(0).ItemCount;
            //testing whether confirm button activate
            //count=0;
        }

        // set flag here for the Start/Confirm Button
        context.getAppClientData().StartButton = (count > 0);

        return `Items: ${count}`;
    });
}

