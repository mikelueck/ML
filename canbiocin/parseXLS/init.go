package parseXLS

import (
	"context"
	"fmt"
	"time"

	"github.com/ML/canbiocin/db"
	pb "github.com/ML/canbiocin/proto"
	"github.com/ML/canbiocin/utils"
	"github.com/golang/protobuf/ptypes"
)

const REFER_TO_LOAD_LIBRARY = 1

func init() {
	fmt.Printf("Initializing the database for test\n")
	ctx := context.Background()
	ProcessFile(ctx,
		"canbiocin/parseXLS/GMP - Probiotic Supplement for Cats and Dogs.xlsx")
	ProcessFile(ctx,
		"canbiocin/parseXLS/Jarred Powder Workbook.xlsx")
	ProcessFile(ctx,
		"canbiocin/parseXLS/Bulk Product Workbook.xlsx")
	// This file doesn't parse properly
	//ProcessFile(ctx,
	//"canbiocin/parseXLS/Soft Chew Workbook.xlsx")
	// After parsing a file we need to reset the Spp and Categories
	db.GetPrebioticsCollection().SetCategoryList(ctx)
	db.GetProbioticsCollection().SetSppList(ctx)

	now, _ := ptypes.TimestampProto(time.Now())
	bc := db.GetBlendingCollection()
	items, _ := bc.QueryByName(ctx, "Labor")
	if len(items) == 0 {
		db.GetBlendingCollection().Create(ctx,
			&pb.Milling_Blending_Packaging{
				Name:                "Labor",
				Cost:                utils.NewMoney(30, 0),
				MostRecentQuoteDate: now,
			})
	}

	items, _ = bc.QueryByName(ctx, "Milling >10kg")
	if len(items) == 0 {
		db.GetBlendingCollection().Create(ctx,
			&pb.Milling_Blending_Packaging{
				Name:                "Milling >10kg",
				Cost:                utils.NewMoney(250, 0),
				MostRecentQuoteDate: now,
			})
	}

	items, _ = bc.QueryByName(ctx, "Milling <10kg")
	if len(items) == 0 {
		db.GetBlendingCollection().Create(ctx,
			&pb.Milling_Blending_Packaging{
				Name:                "Milling <10kg",
				Cost:                utils.NewMoney(50, 0),
				MostRecentQuoteDate: now,
			})
	}
}
