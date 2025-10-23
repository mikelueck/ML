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

type PrebioticParser struct {
	columns    map[string]string
	category   string
	collection *db.PrebioticsCollection
}

func NewPrebioticsParser() *PrebioticParser {
	return &PrebioticParser{
		columns:    make(map[string]string),
		collection: db.GetPrebioticsCollection(),
	}
}

func isPrebioticsHeader(row *xlsxreader.Row) bool {
	if strings.Index(row.Cells[0].Value, "Prebiotics") >= 0 {
		return true
	}
	return false
}

func (p *PrebioticParser) isPrebioticsSection(row *xlsxreader.Row) bool {
	count := getNonEmptyCellCount(row)
	if count < len(p.columns) && String(row, p.columns["markupPercent"]) == "" && row.Cells[0].Value != "" {
		p.category = row.Cells[0].Value
		return true
	}
	return false
}

func (p *PrebioticParser) parseHeader(row *xlsxreader.Row) {
	for _, c := range row.Cells {
		if strings.Index(c.Value, "Prebiotics") >= 0 {
			p.columns["name"] = c.Column
		}
		if strings.Index(c.Value, "Cost") >= 0 && strings.Index(c.Value, "Shipping") < 0 {
			p.columns["costKg"] = c.Column
		}
		if strings.Index(c.Value, "Cost") >= 0 && strings.Index(c.Value, "Shipping") >= 0 {
			p.columns["costShippingKg"] = c.Column
		}
		if strings.Index(c.Value, "Cost+Shipping") >= 0 {
			p.columns["costShippingKg"] = c.Column
		}
		if strings.Index(c.Value, "Supplier") >= 0 {
			p.columns["supplier"] = c.Column
		}
		if strings.Index(c.Value, "Most Recent") >= 0 {
			p.columns["mostRecentQuotaDate"] = c.Column
		}
		if strings.Index(c.Value, "Function") >= 0 {
			p.columns["function"] = c.Column
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

func (p *PrebioticParser) parseIngredient(ctx context.Context, row *xlsxreader.Row) error {
	if isPrebioticsHeader(row) {
		p.parseHeader(row)
		return nil
	}

	if !p.isPrebioticsSection(row) {
		if String(row, p.columns["name"]) != "" && String(row, p.columns["markupPercent"]) != "" {
			c1, err := Money(row, p.columns["costKg"])
			if err != nil {
				return err
			}
			m := getMultiplier()
			if m != 1 {
				c1 = utils.Mult(c1, m)
			}

			c2, err := Money(row, p.columns["costShippingKg"])
			if err != nil {
				return err
			}
			m = getMultiplier()
			if m != 1 {
				c2 = utils.Mult(c2, m)
			}

			ingredient := &pb.Prebiotic{
				Category:            p.category,
				Name:                String(row, p.columns["name"]),
				CostKg:              c1,
				CostShippingKg:      c2,
				Supplier:            &pb.Supplier{Name: String(row, p.columns["supplier"])},
				MostRecentQuoteDate: utils.TimestampProtoStr(String(row, p.columns["mostRecentQuotaDate"])),
				Function:            String(row, p.columns["function"]),
				Notes:               String(row, p.columns["notes"]),
			}
			// Check to see if we already have one of these.
			lookup, err := p.collection.QueryByName(ctx, ingredient.Name)
			if len(lookup) != 0 {
				fmt.Printf("Found %s already present in the database...skipping\n", ingredient.Name)
				return nil
			}
			fmt.Printf("Prebiotic %v\n", ingredient)
			p.collection.Create(ctx, ingredient)
		}
	}
	return nil
}
