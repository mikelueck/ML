package parseXLS

import (
	"context"
	"fmt"

	"github.com/ML/canbiocin/db"
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
}
