import GetProgressPctNum from './GetProgressPctNum';
export default function GetProgressPctText(context) {
   return GetProgressPctNum(context).then(n => `${n}%`);
}