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

type ProbioticParser struct {
	columns    map[string]string
	spp        string
	collection *db.ProbioticsCollection
}

func NewProbioticsParser() *ProbioticParser {
	return &ProbioticParser{
		columns:    make(map[string]string),
		collection: db.GetProbioticsCollection(),
	}
}

func isProbioticsHeader(row *xlsxreader.Row) bool {
	if strings.Index(row.Cells[0].Value, "Probiotics") >= 0 {
		return true
	}
	return false
}

func (p *ProbioticParser) isProbioticsSection(row *xlsxreader.Row) bool {
	count := getNonEmptyCellCount(row)
	if count < len(p.columns) && row.Cells[0].Value != "" {
		p.spp = row.Cells[0].Value
		return true
	}
	return false
}

func (p *ProbioticParser) parseHeader(row *xlsxreader.Row) {
	for _, c := range row.Cells {
		if strings.Index(c.Value, "Probiotics") >= 0 {
			p.columns["strain"] = c.Column
		}
		if strings.Index(c.Value, "Stock") >= 0 {
			p.columns["stockCfuG"] = c.Column
		}
		if strings.Index(c.Value, "Cost") >= 0 && strings.Index(c.Value, "Shipping") < 0 {
			p.columns["costKg"] = c.Column
		}
		if strings.Index(c.Value, "Cost") >= 0 && strings.Index(c.Value, "Shipping") >= 0 {
			p.columns["costShippingKg"] = c.Column
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
	}
}

func (p *ProbioticParser) parseIngredient(ctx context.Context, row *xlsxreader.Row) error {
	if isProbioticsHeader(row) {
		p.parseHeader(row)
		return nil
	}

	if !p.isProbioticsSection(row) {
		if getNonEmptyCellCount(row) >= len(p.columns) {
			toobig, err := Int64(row, p.columns["stockCfuG"])
			if err != nil {
				return err
			}
			stockCfuG := int32(toobig / 1000000) // convert to MCFU/g

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

			ingredient := &pb.Probiotic{
				Spp:                 p.spp,
				Strain:              String(row, p.columns["strain"]),
				StockCfuG:           stockCfuG,
				CostKg:              c1,
				CostShippingKg:      c2,
				Supplier:            &pb.Supplier{Name: String(row, p.columns["supplier"])},
				MostRecentQuoteDate: utils.TimestampProtoStr(String(row, p.columns["mostRecentQuotaDate"])),
				MarkupPercent:       int32(markupPercent),
			}
			// Check to see if we already have one of these.
			lookup, err := p.collection.QueryByName(ctx, ingredient.Strain)
			if len(lookup) != 0 {
				fmt.Printf("Found %s already present in the database...skipping\n", ingredient.Strain)
				return nil
			}
			fmt.Printf("Probiotic %v\n", ingredient)
			p.collection.Create(ctx, ingredient)
		}
	}
	return nil
}
