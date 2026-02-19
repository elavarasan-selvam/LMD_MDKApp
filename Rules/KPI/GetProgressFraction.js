import GetStopFilter from '../Main/GetStopFilter';

export default function GetProgressFraction(context) {

    const service = '/LMD_MDKApp/Services/LMD_MA.service';
    const queryOptions = GetStopFilter(context);

    return context.read(service, 'Stops', [], queryOptions)
        .then(result => {

            let total = result.length;
            let completed = 0;

            if (total === 0) {
                return 0;
            }

            for (let i = 0; i < result.length; i++) {

                const stop = result.getItem(i);

                if (stop.EndDateTime) {
                    completed++;
                }
            }

            let fraction = completed / total;

            if (fraction < 0) fraction = 0;
            if (fraction > 1) fraction = 1;

            return fraction;
        });
}
