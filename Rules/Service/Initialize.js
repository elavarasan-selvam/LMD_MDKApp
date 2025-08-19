export default function Initialize(context) {

    // Perform pre data initialization task

    // Initialize all your Data sources
    // Disabled Lastmilevisitlist and Lastmilereloadrequest service initializations 
    // let _API_LASTMILEVISITLIST = context.executeAction('/LMD_MDKApp/Actions/API_LASTMILEVISITLIST/Service/InitializeOffline.action');
    // let _API_LASTMILERELOADREQUEST = context.executeAction('/LMD_MDKApp/Actions/API_LASTMILERELOADREQUEST/Service/InitializeOffline.action');
    let _DEST_SAMLMD_PPROP = context.executeAction('/LMD_MDKApp/Actions/DEST_SAMLMD_PPROP/Service/InitializeOffline.action');

    //You can add more service initialize actions here
    // Removed _API_LASTMILEVISITLIST and _API_LASTMILERELOADREQUEST 
    return Promise.all([_DEST_SAMLMD_PPROP]).then(() => {
        // After Initializing the DB connections

        // Display successful initialization  message to the user
        return context.executeAction({

            "Name": "/LMD_MDKApp/Actions/GenericToastMessage.action",
            "Properties": {
                "Message": "Application Services Initialized",
                "Animated": true,
                "Duration": 1,
                "IsIconHidden": true,
                "NumberOfLines": 1
            }
        });
    }).catch(() => {
        return false;
    });
}