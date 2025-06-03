package parseXLS

import (
	"context"
  "fmt"
)

const REFER_TO_LOAD_LIBRARY = 1

func init() {
  fmt.Printf("Initializing the database for test\n")
	ProcessFile(context.Background(),
		"canbiocin/parseXLS/GMP - Probiotic Supplement for Cats and Dogs.xlsx")
}
