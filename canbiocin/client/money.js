export function moneyToString(m, precision, justNum) {
  if (!m) {
    return ""
  }
  if (!precision) {
    // Use 5 digits of percision by default
    precision = 5
  }
  let cents = Math.round(m.nanos) / 10000;
  cents = `${cents}`.padEnd(precision, "0");
  cents = cents.slice(0,precision);
  
  if (justNum) {
    return `${m.units}.${cents}`
  } else {
    return `\$${m.units}.${cents}`
  }
}
