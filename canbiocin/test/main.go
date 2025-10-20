package main

import (
	"context"
	"fmt"

	"github.com/ML/canbiocin/db"
	"github.com/ML/canbiocin/parseXLS"
	pb "github.com/ML/canbiocin/proto"
	"github.com/ML/canbiocin/recipe"
)

func main() {
	_ = parseXLS.REFER_TO_LOAD_LIBRARY

	ctx := context.Background()

	recipes, err := db.GetRecipesCollection().QueryByCompanyAndName(ctx, "GMP Labs", "GMP.PRO.BW")
	containers, err := db.GetContainersCollection().List(ctx)

	packaging, err := db.GetPackagingCollection().List(ctx)
	p := []*pb.Packaging{}
	p = append(p, packaging[0].GetProto().(*pb.Packaging))
	p = append(p, packaging[1].GetProto().(*pb.Packaging))

	if err != nil || len(recipes) == 0 {
		fmt.Printf("Bad Recipe: %v\n", err)
	}
	if len(recipes) > 0 {
		r := recipes[0]
		rows, err := recipe.ComputeQuantities(ctx, r, 1, 10000, containers[0].GetProto().(*pb.Container), p, 10000, 0, false)
		if err != nil {
			fmt.Printf("Bad Compute: %v\n", err)
		}
		recipe.PrintTable(rows)
	}
}
