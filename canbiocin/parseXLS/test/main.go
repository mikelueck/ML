package main

import (
	"context"

	"github.com/ML/canbiocin/parseXLS"
)

func main() {
	ctx := context.Background()

	parseXLS.ProcessFile(ctx,
		"canbiocin/parseXLS/GMP - Probiotic Supplement for Cats and Dogs.xlsx")
	parseXLS.ProcessFile(ctx,
		"canbiocin/parseXLS/GMP - Probiotic Supplement for Cats and Dogs.xlsx")
}
