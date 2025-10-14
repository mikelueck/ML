package parseXLS

import (
	"context"
	"fmt"
	"log"
	"math"
	"strings"

	"github.com/ML/canbiocin/db"
	pb "github.com/ML/canbiocin/proto"

	"github.com/thedatashed/xlsxreader"
)

type RecipeParser struct {
	columns           map[string]string
	name              string
	company           string
	overage           int32
	ingredientSection string
	probiotics        []*pb.ProbioticIngredient
	prebiotics        []*pb.PrebioticIngredient
	postbiotics       []*pb.PostbioticIngredient
	collection        *db.RecipesCollection
}

func NewRecipeParser() *RecipeParser {
	return &RecipeParser{
		columns:     make(map[string]string),
		collection:  db.GetRecipesCollection(),
		probiotics:  []*pb.ProbioticIngredient{},
		prebiotics:  []*pb.PrebioticIngredient{},
		postbiotics: []*pb.PostbioticIngredient{},
	}
}

func isRecipesHeader(row *xlsxreader.Row) bool {
	colB := getCellForColumn(row, "B")
	if colB != nil {
		if strings.Index(strings.ToUpper(colB.Value), "INGREDIENTS") >= 0 {
			return true
		}
	}
	return false
}

func (p *RecipeParser) parseIngredientSection(row *xlsxreader.Row) {
	if row.Cells[0].Column == "A" && len(p.columns) > 0 {
		p.ingredientSection = row.Cells[0].Value
	}
}

func (p *RecipeParser) parseHeader(row *xlsxreader.Row) {
	for _, c := range row.Cells {
		if strings.Index(c.Value, "Probiotics") >= 0 {
			p.columns["strain"] = c.Column
		}
		if strings.Index(c.Value, "Ingredients") >= 0 {
			p.columns["ingredient"] = c.Column
		}
		if strings.Index(c.Value, "Concentration") >= 0 {
			p.columns["cfuG"] = c.Column
		}

		if strings.Index(c.Value, "mg/serving") >= 0 {
			p.columns["mgServing"] = c.Column
		}
	}
}

func (p *RecipeParser) parseCompanyName(row *xlsxreader.Row) bool {
	if len(row.Cells) > 1 && strings.Index(strings.ToUpper(row.Cells[0].Value), "COMPANY") >= 0 {
		p.company = row.Cells[1].Value
		return true
	}
	return false
}

func (p *RecipeParser) parseOverage(row *xlsxreader.Row) bool {
	if len(row.Cells) > 1 && strings.Index(strings.ToUpper(row.Cells[0].Value), "OVERAGE") >= 0 {
		tmp, _ := Float(row, row.Cells[1].Column)
		p.overage = int32(tmp * 100)
		return true
	}
	return false
}

func (p *RecipeParser) adjustForServingSize() {
	// What I have found is that the Probiotics section is not scaling properly
	// In the sheet it ends up working fine for 1g servings but anything larger
	// or smaller end up diluting the probiotics

	// The prebiotics and postbiotics see accurate for the mg/serving but here we
	// try to move it to mg/g and you specify the size of the serving at "blend"
	// time.

	var total float32 = 0.0

	for _, i := range p.prebiotics {
		total += i.GetMgServing()
	}
	for _, i := range p.postbiotics {
		total += i.GetMgServing()
	}

	servingSize := float32(math.Ceil(float64(total / 1000.0)))
	log.Printf("######################\n")
	log.Printf("Scaling ingredients for 1g serving size, identified as %fg\n", servingSize)
	log.Printf("######################\n")

	if servingSize != 1 {
		for _, i := range p.prebiotics {
			i.MgServing = i.MgServing / servingSize
		}
		for _, i := range p.postbiotics {
			i.MgServing = i.MgServing / servingSize
		}
	}
}

func (p *RecipeParser) parse(ctx context.Context, xl *xlsxreader.XlsxFile) error {
	p.name = xl.Sheets[0]
	for row := range xl.ReadRows(xl.Sheets[0]) {
		err := p.parseRecipe(ctx, &row)
		if err != nil {
			return err
		}
	}

	// Here we try to normalize things so that we use mg/g rather than mg/serving
	p.adjustForServingSize()

	p.save(ctx)
	return nil
}

func (p *RecipeParser) save(ctx context.Context) error {
	recipe := &pb.Recipe{
		Name:                    p.name,
		Company:                 &pb.Company{Name: p.company},
		ProbioticOveragePercent: p.overage,
		Probiotics:              p.probiotics,
		Prebiotics:              p.prebiotics,
		Postbiotics:             p.postbiotics,
	}

	// Check to see if we already have one of these.
	lookup, _ := db.GetRecipesCollection().QueryByCompanyAndName(ctx, recipe.GetCompany().GetName(), recipe.Name)
	if len(lookup) != 0 {
		fmt.Printf("Found recipe %s %s already present in the database...skipping\n",
			recipe.GetCompany().GetName(), recipe.GetName())
		return nil
	}

	db.GetRecipesCollection().Create(ctx, recipe)
	fmt.Printf("Recipe: %s - %s\n", recipe.GetCompany().GetName(), recipe.GetName())
	fmt.Printf("Overage: %v\n", recipe.GetProbioticOveragePercent())
	for _, item := range recipe.Probiotics {
		fmt.Printf("%v\n", item)
	}
	for _, item := range recipe.Prebiotics {
		fmt.Printf("%v\n", item)
	}
	for _, item := range recipe.Postbiotics {
		fmt.Printf("%v\n", item)
	}

	return nil
}

func (p *RecipeParser) parseRecipe(ctx context.Context, row *xlsxreader.Row) error {
	if p.company == "" && p.parseCompanyName(row) {
		return nil
	}
	if p.overage == 0 && p.parseOverage(row) {
		return nil
	}

	if isRecipesHeader(row) {
		p.parseHeader(row)
		return nil
	}

	p.parseIngredientSection(row)

	if len(p.columns) > 0 && p.ingredientSection != "" {
		ingredient := String(row, p.columns["ingredient"])
		if getNonEmptyCellCount(row) >= len(p.columns) && ingredient != "" {
			switch {
			case p.ingredientSection == "Probiotics":
				toobig, err := Int64(row, p.columns["cfuG"])
				if err != nil {
					return err
				}
				desiredCfuG := int32(toobig / 1000000) // convert to MCFU/g

				lookup, err := db.GetProbioticsCollection().QueryByName(ctx, ingredient)
				if len(lookup) != 1 {
					return fmt.Errorf("Tried to lookup %s but found %d entries\n", ingredient, len(lookup))
				}

				p.probiotics = append(p.probiotics, &pb.ProbioticIngredient{Item: lookup[0].GetID(), CfuG: desiredCfuG})
			case (p.ingredientSection == "Prebiotics" ||
				p.ingredientSection == "Postbiotics"):
				mgServing, err := Float(row, p.columns["mgServing"])
				if err != nil {
					return err
				}

				// Try to find in Prebiotics
				lookup, err := db.GetPrebioticsCollection().QueryByName(ctx, ingredient)
				if len(lookup) == 1 {
					p.prebiotics = append(p.prebiotics, &pb.PrebioticIngredient{Item: lookup[0].GetID(), MgServing: float32(mgServing)})
				} else {
					// Try to find in Postbiotics
					lookup, err := db.GetPostbioticsCollection().QueryByName(ctx, ingredient)
					if err != nil {
						return fmt.Errorf("Tried to lookup %s but found %d entries\n", ingredient, len(lookup))
					}
					p.postbiotics = append(p.postbiotics, &pb.PostbioticIngredient{Item: lookup[0].GetID(), MgServing: float32(mgServing)})
				}

			}
		}
	}
	return nil
}
