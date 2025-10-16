import GetTotalStops from './GetTotalStops';

export default function InitializeKPIs(context) {
    const appData = context.getAppClientData();
    // Always make sure these exist (prevents blanks after onboarding/reset)
    if (appData.KPICompletedStops == null) {
        appData.KPICompletedStops = 0;
    }
    if (appData.TotalStops == null) {
        appData.TotalStops = 0;
    }
    // Get total stops dynamically (if available in backend)
    return GetTotalStops(context).then(total => {
        appData.TotalStops = total || 0;
        // Just log for verification
        console.log('KPI Initialized:', appData);
        return true;
    }).catch(error => {
        console.log('KPI Initialization failed:', error);
        return true;
    });
}
 