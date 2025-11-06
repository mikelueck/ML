const { create } = require('@bufbuild/protobuf')
const pb = require('../proto/money_pb.js');

const nanos_pow = 9;
const nanos_per_cent = Math.pow(10, nanos_pow - 1);
const nanos_per_unit = Math.pow(10, nanos_pow);

export function moneyToFloat(m, precision) {
  if (!m) {
    return 0.0
  }
  if (!precision) {
    // Use 5 digits of precision by default
    precision = 5
  }

  let retval = Number(m.units);

  let shift = Math.pow(10, nanos_pow - precision)
  let cents = Math.round(m.nanos / shift) 

  return retval + (cents / Math.pow(10, precision))
}

export function floatToMoney(f) {
    let money = create(pb.MoneySchema, {});
    money.units = Math.trunc(f)

    money.nanos = Math.round((f-money.units) * nanos_per_unit)
    return money
}

export function moneyToString(m, precision, justNum) {
  if (!m) {
    return ""
  }
  if (!precision) {
    // Use 5 digits of precision by default
    precision = 5
  }

  let max = Math.pow(10, precision)
  let shift = Math.pow(10, nanos_pow - precision)
  let cents = Math.round(m.nanos / shift) 

  // It's possible cents > max in which case we have to move digits over to
  // dollars
  let units = m.units

  while (cents >= max) {
    cents = cents - max 
    units += 1
  }

  // We need to figure out a prefix when it is single digit (or less) cents
  let prefix = "";
  let tmp = `${cents}`;
  if (tmp.length < precision) {
    prefix = "".padEnd(precision-tmp.length, "0")
  }

  let centsStr = `${prefix}${cents}`.padEnd(precision, "0");
  centsStr = centsStr.slice(0,precision);
  
  let moneyStr = `${units}.${centsStr}`
  if (!justNum) {
    return `\$${moneyStr}`
  }
  return moneyStr
}
