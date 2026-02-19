import GetProgressFraction from './GetProgressFraction';

export default function GetProgressPctNum(context) {
    return GetProgressFraction(context)
        .then(f => Math.round(f * 100));
}
