package utils

import (
	"fmt"
	"math"

	pb "github.com/ML/canbiocin/proto"
)

const nanos_per_cent = 10000000
const nanos_per_unit = 1000000000

func toNanos(c int32) int32 {
	return c * nanos_per_cent
}

func NewMoney(dollars int32, cents int32) *pb.Money {
	return &pb.Money{Units: int64(dollars), Nanos: toNanos(cents)}
}

func Add(a *pb.Money, b *pb.Money) *pb.Money {
	units := a.GetUnits() + b.GetUnits()
	nanos := a.GetNanos() + b.GetNanos()
	for nanos > nanos_per_unit {
		units++
		nanos -= nanos_per_unit
	}
	return &pb.Money{Units: units, Nanos: nanos}
}

func ToFloat(m *pb.Money) float64 {
	x := float64(m.GetUnits())
	y := float64(m.GetNanos()) / nanos_per_unit
	return x + y
}

func String(m *pb.Money) string {
	// Use 5 digits of percision

	cents := int32(math.Round(float64(m.GetNanos()) / float64(10000)))

	return fmt.Sprintf("$%d.%05d", m.GetUnits(), cents)
}

func ToMoney(m float64) *pb.Money {
	units := math.Floor(m)
	nanos := math.Floor(math.Round((m - units) * nanos_per_unit))
	return &pb.Money{Units: int64(units), Nanos: int32(nanos)}
}

func Mult(a *pb.Money, b float64) *pb.Money {
	amount := ToFloat(a) * b
	return ToMoney(amount)
}

func Div(a *pb.Money, b float64) *pb.Money {
	amount := ToFloat(a) / b
	return ToMoney(amount)
}
