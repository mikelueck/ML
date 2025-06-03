package main

import (
	"context"
	"fmt"

	"github.com/ML/canbiocin/db"
	"github.com/ML/canbiocin/recipe"
  "github.com/ML/canbiocin/parseXLS"
)

func main() {
  _ = parseXLS.REFER_TO_LOAD_LIBRARY

	ctx := context.Background()

	recipes, err := db.GetRecipesCollection().QueryByCompanyAndName(ctx, "GMP Labs", "GMP.PRO.BW")

	if err != nil || len(recipes) == 0 {
		fmt.Printf("Bad Recipe: %v\n", err)
	}
	if len(recipes) > 0 {
		r := recipes[0]
		rows, err := recipe.ComputeQuantities(ctx, r, 1, 10000)
		if err != nil {
			fmt.Printf("Bad Compute: %v\n", err)
		}
		recipe.PrintTable(rows)
	}
}
