package utils

import (
	"time"

	"github.com/golang/protobuf/ptypes"
	timestamppb "github.com/golang/protobuf/ptypes/timestamp"
)

func TimestampProto(year int, month time.Month, day int) *timestamppb.Timestamp {
	tp, _ := ptypes.TimestampProto(time.Date(year, month, day, 0, 0, 0, 0, time.UTC))
	return tp
}

func TimestampProtoStr(dateString string) *timestamppb.Timestamp {
	t, _ := time.Parse(time.DateOnly, dateString)
	tp, _ := ptypes.TimestampProto(t)
	return tp
}
