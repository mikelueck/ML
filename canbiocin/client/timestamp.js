import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb"
const { create } = require('@bufbuild/protobuf')
import { TimestampSchema } from "@bufbuild/protobuf/wkt";

export function timestampToDate(timestamp) {
  if (timestamp) {
    let sec = timestamp.getSeconds ? timestamp.getSeconds() : timestamp.seconds
    let nanos = timestamp.getNanos ? timestamp.getNanos() : timestamp.nanos
    let milliseconds = BigInt(sec) * BigInt(1000) + BigInt(nanos / 1000000);
    return new Date(Number(milliseconds));
  } else {
    return null
  }
}

export function dateToTimestamp(date) {
  let ts = Timestamp.fromDate(date)
  // We convert from the google.protobuf format to the bufbuild format
  return create(TimestampSchema, {nanos: ts.getNanos(), seconds: ts.getSeconds()})
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
