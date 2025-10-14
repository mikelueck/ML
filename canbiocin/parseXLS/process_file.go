package parseXLS

import (
	"context"
	"flag"
	"fmt"
	"log"
	"math"
	"strconv"
	"strings"

	pb "github.com/ML/canbiocin/proto"
	"github.com/ML/canbiocin/utils"
	"github.com/thedatashed/xlsxreader"

	"math/rand/v2"
)

type ParseType int

var (
	fake = flag.Bool("fake", false, "grpcport")
)

func getMultiplier() float64 {
	if *fake {
		return rand.Float64()
	}
	return 1.0
}

func getNonEmptyCellCount(row *xlsxreader.Row) int {
	count := 0
	for _, cell := range row.Cells {
		// count non empty values
		if cell.Value != "" {
			count++
		}
	}
	return count
}

// Rows are missing cells that are empty so you have to lookup by column id
func getCellForColumn(row *xlsxreader.Row, col string) *xlsxreader.Cell {
	for _, c := range row.Cells {
		if c.Column == col {
			return &c
		}
	}
	return nil
}

func Float(row *xlsxreader.Row, col string) (float64, error) {
	cell := getCellForColumn(row, col)
	if cell == nil {
		return 0.0, nil
	}
	return strconv.ParseFloat(cell.Value, 64)
}

func Money(row *xlsxreader.Row, col string) (*pb.Money, error) {
	val := String(row, col)
	parts := strings.Split(val, ".")
	var units int64
	var cents int64
	var err error

	if len(parts) > 0 && len(parts[0]) > 0 {
		units, err = strconv.ParseInt(parts[0], 10, 64)
		if err != nil {
			return nil, err
		}
	}
	if len(parts) == 2 && len(parts[1]) > 0 {
		// In cases where we have $34.30 this will look like 34.3 so it will get parsed as 3 instead of 30
		// we pad parts[1] to have it be 30 instead
		for len(parts[1]) < 2 {
			parts[1] = fmt.Sprintf("%s0", parts[1])
		}
		cents, err = strconv.ParseInt(parts[1], 10, 64)
		// for some reason some of these values in the spreadsheet are very large probably due to float issues
		// try to compensate here and just convert this to cents
		if len(parts[1]) > 2 {
			len := len(parts[1])
			if len > 2 {
				tmp := float64(cents) / math.Pow(10, float64(len-2))
				cents = int64(math.Round(tmp))
			}
		}
		if err != nil {
			return nil, err
		}
	}

	return utils.NewMoney(int32(units), int32(cents)), nil
}

func Int64(row *xlsxreader.Row, col string) (int64, error) {
	cell := getCellForColumn(row, col)
	if cell == nil {
		return -1, nil
	}
	i, err := strconv.ParseInt(cell.Value, 10, 64)
	return i, err
}

func String(row *xlsxreader.Row, col string) string {
	cell := getCellForColumn(row, col)
	if cell == nil {
		return ""
	}
	return cell.Value
}

type Parser interface {
	parseIngredient(ctx context.Context, row *xlsxreader.Row) error
}

func ReadIngredients(ctx context.Context, xl *xlsxreader.XlsxFile) error {
	var parser Parser = nil
	var prevRow *xlsxreader.Row
	var lastHeaderRow *xlsxreader.Row

	ingredientSheet := len(xl.Sheets) - 1 //It's usually the last one
	ingredientSheetName := "INGREDIENT PRICING"
	for i := range xl.Sheets {
		if xl.Sheets[i] == ingredientSheetName {
			ingredientSheet = i
			break
		}
	}

	for row := range xl.ReadRows(xl.Sheets[ingredientSheet]) {
		if row.Error != nil {
			log.Printf("Error parsing Ingredients: %v\n", row.Error)
			return row.Error
		}
		if row.Cells[0].Type == xlsxreader.TypeString {
			if getNonEmptyCellCount(&row) == 0 || (prevRow != nil && prevRow.Cells[0].Row+1 != row.Cells[0].Row) {
				// Sometimes there is a blank line right after a header
				if lastHeaderRow != nil && lastHeaderRow.Cells[0].Row+2 != row.Cells[0].Row {
					parser = nil
				}
			}
			if isProbioticsHeader(&row) {
				lastHeaderRow = &row
				parser = NewProbioticsParser()
			}
			if isPrebioticsHeader(&row) {
				lastHeaderRow = &row
				parser = NewPrebioticsParser()
			}
			if isPostbioticsHeader(&row) {
				lastHeaderRow = &row
				parser = NewPostbioticsParser()
			}
			if parser != nil {
				err := parser.parseIngredient(ctx, &row)
				if err != nil {
					fmt.Printf("Error %v\n", err)
					return err
				}
			}
		}
		prevRow = &row
	}
	return nil
}

func ProcessFile(ctx context.Context, fileName string) error {
	xl, err := xlsxreader.OpenFile(fileName)

	if err != nil {
		log.Printf("Error parsing XLS: %v\n", err)
		return err
	}

	defer xl.Close()

	// Ingest the ingredients first.  This is the last sheet.
	log.Printf("Parsing ingredients\n")
	err = ReadIngredients(ctx, &xl.XlsxFile)
	if err != nil {
		log.Printf("Error parsing ingredients XLS: %v\n", err)
		return err
	}

	log.Printf("Parsing recipes\n")
	recipeParser := NewRecipeParser()
	err = recipeParser.parse(ctx, &xl.XlsxFile)
	if err != nil {
		log.Printf("Error parsing recipe XLS: %v\n", err)
		return err
	}

	return nil
}
