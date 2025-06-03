export function timestampToDate(timestamp) {
  if (timestamp) {
    let milliseconds = BigInt(timestamp.seconds) * BigInt(1000) + BigInt(timestamp.nanos / 1000000);
    return new Date(Number(milliseconds));
  } else {
    return null
  }
}

export function timestampToDateString(timestamp) {
  if (timestamp) {
    let milliseconds = BigInt(timestamp.seconds) * BigInt(1000) + BigInt(timestamp.nanos / 1000000);
    let date = new Date(Number(milliseconds));
    let month = date.getMonth()
    let day = date.getDate()
    let year = date.getFullYear()
    return  `${month}/${day}/${year}`;
  } else {
    return ""
  }
}
