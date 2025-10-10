package parseXLS

import (
	"context"
	"fmt"

	"github.com/ML/canbiocin/db"
	pb "github.com/ML/canbiocin/proto"
	"github.com/ML/canbiocin/utils"
)

const REFER_TO_LOAD_LIBRARY = 1

func init() {
	fmt.Printf("Initializing the database for test\n")
	ctx := context.Background()
	ProcessFile(ctx,
		"canbiocin/parseXLS/GMP - Probiotic Supplement for Cats and Dogs.xlsx")
	// After parsing a file we need to reset the Spp and Categories
	db.GetPrebioticsCollection().SetCategoryList(ctx)
	db.GetProbioticsCollection().SetSppList(ctx)

	db.GetContainersCollection().Create(ctx, &pb.Container{
		Name:                "Foil Bag",
		SizeG:               10000,
		UnitCost:            utils.NewMoney(0, 25),
		UnitCostShipping:    utils.NewMoney(0, 25),
		MostRecentQuoteDate: utils.TimestampProto(2020, 3, 13),
		MarkupPercent:       0,
		Notes:               "A 10kg foilbag for bulk",
	})
	db.GetContainersCollection().Create(ctx, &pb.Container{
		Name:                "Glass jar",
		SizeG:               250,
		UnitCost:            utils.NewMoney(2, 50),
		UnitCostShipping:    utils.NewMoney(2, 50),
		MostRecentQuoteDate: utils.TimestampProto(2020, 3, 13),
		MarkupPercent:       100,
		Notes:               "A 250g jar",
	})
}
