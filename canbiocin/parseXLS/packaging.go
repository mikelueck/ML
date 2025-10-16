package parseXLS

import (
	"context"
	"fmt"
	"strings"

	"github.com/ML/canbiocin/db"
	pb "github.com/ML/canbiocin/proto"
	"github.com/ML/canbiocin/utils"

	"github.com/thedatashed/xlsxreader"
)

type PackagingParser struct {
	columns              map[string]string
	packagingCollection  *db.PackagingCollection
	containersCollection *db.ContainersCollection
}

func NewPackagingParser() *PackagingParser {
	return &PackagingParser{
		columns:              make(map[string]string),
		packagingCollection:  db.GetPackagingCollection(),
		containersCollection: db.GetContainersCollection(),
	}
}

func isPackagingHeader(row *xlsxreader.Row) bool {
	if strings.Index(row.Cells[0].Value, "Packaging") == 0 &&
		len(row.Cells) >= 7 {
		return true
	}
	return false
}

func (p *PackagingParser) isPackagingSection(row *xlsxreader.Row) bool {
	count := getNonEmptyCellCount(row)
	if count < len(p.columns) && String(row, p.columns["markupPercent"]) == "" && row.Cells[0].Value != "" {
		return true
	}
	return false
}

func (p *PackagingParser) parseHeader(row *xlsxreader.Row) {
	for _, c := range row.Cells {
		if strings.Index(c.Value, "Packaging") >= 0 ||
			strings.Index(c.Value, "Containers") >= 0 {
			p.columns["name"] = c.Column
		}
		if strings.Index(c.Value, "Total cost") >= 0 {
			p.columns["totalCost"] = c.Column
		}
		if strings.Index(c.Value, "Units") >= 0 {
			p.columns["unitsPerCase"] = c.Column
		}
		if strings.Index(c.Value, "Needed") >= 0 {
			p.columns["amountNeededForOrder"] = c.Column
		}
		if strings.Index(c.Value, "Supplier") >= 0 {
			p.columns["supplier"] = c.Column
		}
		if strings.Index(c.Value, "Most Recent") >= 0 {
			p.columns["mostRecentQuotaDate"] = c.Column
		}
		if strings.Index(c.Value, "Markup") >= 0 {
			p.columns["markupPercent"] = c.Column
		}
		if c.Value == "Notes" {
			p.columns["notes"] = c.Column
		}
	}
	_, ok := p.columns["notes"]
	if !ok {
		// In the spreadsheet I have the "notes" column isn't labeled so we just assume it's after "markup"
		col := p.columns["markupPercent"]
		runes := []rune(col)
		r := runes[0]
		r++
		p.columns["notes"] = string(r)
	}
}

func isContainer(packaging *pb.Packaging) bool {
	if strings.Index(packaging.Name, "oz") > 0 ||
		strings.Index(packaging.Name, "kg") > 0 ||
		strings.Index(packaging.Name, "kg") > 0 {
		return true
	}
	return false
}

func (p *PackagingParser) parseIngredient(ctx context.Context, row *xlsxreader.Row) error {
	if isPackagingHeader(row) {
		p.parseHeader(row)
		return nil
	}

	if !p.isPackagingSection(row) {
		if String(row, p.columns["name"]) != "" && String(row, p.columns["markupPercent"]) != "" {
			c, err := Money(row, p.columns["totalCost"])
			if err != nil {
				return err
			}
			m := getMultiplier()
			if m != 1 {
				c = utils.Mult(c, m)
			}

			tmp, err := Float(row, p.columns["markupPercent"])
			if err != nil {
				return err
			}
			markupPercent := int32(tmp * 100 * getMultiplier())

			units, err := Int64(row, p.columns["unitsPerCase"])
			if err != nil {
				return err
			}

			amountNeededForOrder, err := Int64(row, p.columns["amountNeededForOrder"])

			if err != nil {
				//Error is ok
				//return err
			}

			packaging := &pb.Packaging{
				Name:                 String(row, p.columns["name"]),
				TotalCost:            c,
				UnitsPackage:         int32(units),
				AmountNeededForOrder: int32(amountNeededForOrder),
				Supplier:             &pb.Supplier{Name: String(row, p.columns["supplier"])},
				MostRecentQuoteDate:  utils.TimestampProtoStr(String(row, p.columns["mostRecentQuotaDate"])),
				MarkupPercent:        int32(markupPercent),
				Notes:                String(row, p.columns["notes"]),
			}

			if isContainer(packaging) {
				// Check to see if we already have one of these.
				lookup, _ := p.containersCollection.QueryByName(ctx, packaging.Name)
				if len(lookup) != 0 {
					fmt.Printf("Found %s already present in the database...skipping\n", packaging.Name)
					return nil
				}
				container := &pb.Container{
					Packaging: packaging,
				}
				fmt.Printf("Container %v\n", container)
				p.containersCollection.Create(ctx, container)
			} else {
				// Check to see if we already have one of these.
				lookup, _ := p.packagingCollection.QueryByName(ctx, packaging.Name)
				if len(lookup) != 0 {
					fmt.Printf("Found %s already present in the database...skipping\n", packaging.Name)
					return nil
				}
				fmt.Printf("Packaging %v\n", packaging)
				p.packagingCollection.Create(ctx, packaging)
			}
		}
	}
	return nil
}
