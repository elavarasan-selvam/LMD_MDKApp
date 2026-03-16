import GetStopFilter from '../Main/GetStopFilter';

export default function GetStopsFractionText(context) {

    const service = '/LMD_MDKApp/Services/LMD_MA.service';
    const queryOptions = GetStopFilter(context);

    return context.read(service, 'Stops', [], queryOptions)
        .then(result => {

            let total = result.length;
            let completed = 0;

            for (let i = 0; i < result.length; i++) {

                const stop = result.getItem(i);

                if (stop.EndDateTime) {
                    completed++;
                }
            }

            return "       " + completed + " / " + total + " Stops";
        });
}
