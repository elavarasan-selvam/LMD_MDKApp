/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function CalculateProgressPercent(clientAPI) {
    let completed = context.binding.StopsCompleted;
    let total = context.binding.TotalStops;

    if (!total || total === 0) {
        return 0;
    }

    let percent = Math.round((completed / total) * 100);
    return percent;
}
