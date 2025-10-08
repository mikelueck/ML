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

type PostbioticParser struct {
	columns    map[string]string
	collection *db.PostbioticsCollection
}

func NewPostbioticsParser() *PostbioticParser {
	return &PostbioticParser{
		columns:    make(map[string]string),
		collection: db.GetPostbioticsCollection(),
	}
}

func isPostbioticsHeader(row *xlsxreader.Row) bool {
	if strings.Index(row.Cells[0].Value, "Postbiotics") >= 0 {
		return true
	}
	return false
}

func (p *PostbioticParser) isPostbioticsSection(row *xlsxreader.Row) bool {
	count := getNonEmptyCellCount(row)
	if count < len(p.columns) && String(row, p.columns["markupPercent"]) == "" && row.Cells[0].Value != "" {
		return true
	}
	return false
}

func (p *PostbioticParser) parseHeader(row *xlsxreader.Row) {
	for _, c := range row.Cells {
		if strings.Index(c.Value, "Postbiotics") >= 0 {
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
}

func (p *PostbioticParser) parseIngredient(ctx context.Context, row *xlsxreader.Row) error {
	if isPostbioticsHeader(row) {
		p.parseHeader(row)
		return nil
	}

	if !p.isPostbioticsSection(row) {
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

			tmp, err := Float(row, p.columns["markupPercent"])
			if err != nil {
				return err
			}
			markupPercent := int32(tmp * 100 * getMultiplier())

			ingredient := &pb.Postbiotic{
				Name:                String(row, p.columns["name"]),
				CostKg:              c1,
				CostShippingKg:      c2,
				Supplier:            &pb.Supplier{Name: String(row, p.columns["supplier"])},
				MostRecentQuoteDate: utils.TimestampProtoStr(String(row, p.columns["mostRecentQuotaDate"])),
				MarkupPercent:       int32(markupPercent),
				Function:            String(row, p.columns["function"]),
				Notes:               String(row, p.columns["notes"]),
			}
			// Check to see if we already have one of these.
			lookup, err := p.collection.QueryByName(ctx, ingredient.Name)
			if len(lookup) != 0 {
				fmt.Printf("Found %s already present in the database...skipping\n", ingredient.Name)
				return nil
			}
			fmt.Printf("Postbiotic %v\n", ingredient)
			p.collection.Create(ctx, ingredient)
		}
	}
	return nil
}
