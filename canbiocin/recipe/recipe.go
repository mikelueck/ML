package recipe

import (
	"context"
	"fmt"
	"math"

	"github.com/ML/canbiocin/db"
	pb "github.com/ML/canbiocin/proto"
	"github.com/ML/canbiocin/utils"

	"github.com/golang/protobuf/ptypes"
)

func generateProbioticRow(
	ctx context.Context,
	servingSizeGrams int32,
	numServingsPerContainer int32,
	grams int32,
	discountPercent int32,
	overagePercent int32,
	item *pb.ProbioticIngredient) (*pb.IngredientDetails, error) {
	// the stock probiotics are more concentrated so need to be diluted
	probioticDoc, err := db.GetProbioticsCollection().Get(ctx, item.GetItem())
	if err != nil {
		return nil, err
	}
	probiotic := probioticDoc.GetProto().(*pb.Probiotic)

	percent := float64(item.GetCfuG()) / float64(probiotic.GetStockCfuG())
	perserving := float64(servingSizeGrams) * percent
	overage_factor := (1 + float64(overagePercent)/100)
	total := float64(grams) * percent * overage_factor
	cbCostKg := probiotic.GetCostKg()
	cbTotal := utils.Mult(cbCostKg, total/1000)
	cbCostPerContainer := utils.Mult(utils.Div(cbCostKg, 1000), float64(numServingsPerContainer)*float64(perserving*overage_factor))
	markupPercent := probiotic.GetMarkupPercent() - discountPercent
	clientTotal := utils.Mult(cbTotal, (1.0 + (float64(markupPercent) / float64(100))))

	row := &pb.IngredientDetails{
		Ingredient:         &pb.Ingredient{Item: &pb.Ingredient_Probiotic{Probiotic: probiotic}},
		DesiredCfuG:        item.GetCfuG(),
		Percent:            percent,
		PerservingMg:       perserving * 1000.0,
		TotalGrams:         total,
		CbCostKg:           cbCostKg,
		CbCostPerContainer: cbCostPerContainer,
		MarkupPercent:      markupPercent,
		CbTotal:            cbTotal,
		ClientTotal:        clientTotal,
	}
	return row, nil
}

func generatePrebioticRow(
	ctx context.Context,
	servingSizeGrams int32,
	numServingsPerContainer int32,
	grams int32,
	discountPercent int32,
	item *pb.PrebioticIngredient) (*pb.IngredientDetails, error) {
	prebioticDoc, err := db.GetPrebioticsCollection().Get(ctx, item.GetItem())
	if err != nil {
		return nil, err
	}
	prebiotic := prebioticDoc.GetProto().(*pb.Prebiotic)

	perserving := float64(item.GetMgServing()) * float64(servingSizeGrams)
	percent := perserving / float64(servingSizeGrams) / 1000.0
	total := float64(grams) / float64(servingSizeGrams) * perserving / 1000.0
	cbCostKg := prebiotic.GetCostKg()
	cbTotal := utils.Mult(cbCostKg, total/1000)
	cbCostPerContainer := utils.Mult(utils.Div(cbCostKg, 1000), float64(numServingsPerContainer)*float64(perserving/1000))
	markupPercent := prebiotic.GetMarkupPercent() - discountPercent
	clientTotal := utils.Mult(cbTotal, (1.0 + (float64(markupPercent) / float64(100))))

	row := &pb.IngredientDetails{
		Ingredient:         &pb.Ingredient{Item: &pb.Ingredient_Prebiotic{Prebiotic: prebiotic}},
		Percent:            percent,
		PerservingMg:       perserving,
		TotalGrams:         total,
		CbCostKg:           cbCostKg,
		CbCostPerContainer: cbCostPerContainer,
		MarkupPercent:      markupPercent,
		CbTotal:            cbTotal,
		ClientTotal:        clientTotal,
	}
	return row, nil
}

func generatePostbioticRow(
	ctx context.Context,
	servingSizeGrams int32,
	numServingsPerContainer int32,
	grams int32,
	discountPercent int32,
	item *pb.PostbioticIngredient) (*pb.IngredientDetails, error) {
	postbioticDoc, err := db.GetPostbioticsCollection().Get(ctx, item.GetItem())
	if err != nil {
		return nil, err
	}
	postbiotic := postbioticDoc.GetProto().(*pb.Postbiotic)

	perserving := float64(item.GetMgServing()) * float64(servingSizeGrams)
	percent := perserving / float64(servingSizeGrams) / 1000.0
	total := float64(grams) / float64(servingSizeGrams) * perserving / 1000.0
	cbCostKg := postbiotic.GetCostKg()
	cbTotal := utils.Mult(cbCostKg, total/1000)
	cbCostPerContainer := utils.Mult(utils.Div(cbCostKg, 1000), float64(numServingsPerContainer)*float64(perserving/1000))
	markupPercent := postbiotic.GetMarkupPercent() - discountPercent
	clientTotal := utils.Mult(cbTotal, (1.0 + (float64(markupPercent) / float64(100))))

	row := &pb.IngredientDetails{
		Ingredient:         &pb.Ingredient{Item: &pb.Ingredient_Postbiotic{Postbiotic: postbiotic}},
		Percent:            percent,
		PerservingMg:       perserving,
		TotalGrams:         total,
		CbCostKg:           cbCostKg,
		CbCostPerContainer: cbCostPerContainer,
		MarkupPercent:      markupPercent,
		CbTotal:            cbTotal,
		ClientTotal:        clientTotal,
	}
	return row, nil
}

func generatePackagingRow(
	ctx context.Context,
	servingSizeGrams int32,
	containerSizeGrams int32,
	grams int32,
	discountPercent int32,
	packaging *pb.Packaging) (*pb.IngredientDetails, error) {
	servingsPerContainer := int32(math.Floor(float64(containerSizeGrams) / float64(servingSizeGrams)))

	fmt.Printf("Total: %v\n", packaging.GetTotalCost())
	fmt.Printf("#: %v\n", packaging.GetUnitsPackage())
	totalCost := packaging.GetTotalCost()
	unitsPerPackage := packaging.GetUnitsPackage()
	cbCostPerContainer := utils.Div(totalCost, float64(unitsPerPackage))
	numContainers := math.Ceil(float64(grams) / float64(servingsPerContainer*servingSizeGrams))

	markupPercent := packaging.GetMarkupPercent() - discountPercent
	cbTotal := utils.Mult(cbCostPerContainer, numContainers)
	clientTotal := utils.Mult(cbTotal, (1.0 + (float64(markupPercent) / float64(100))))

	row := &pb.IngredientDetails{
		Ingredient:         &pb.Ingredient{Item: &pb.Ingredient_Packaging{Packaging: packaging}},
		TotalGrams:         numContainers,
		CbCostPerContainer: cbCostPerContainer,
		MarkupPercent:      markupPercent,
		CbTotal:            cbTotal,
		ClientTotal:        clientTotal,
	}
	return row, nil
}

// Given a recipe and number of grams required outputs number of milligrams for each ingredient
func ComputeQuantities(ctx context.Context, doc *db.RecipeDoc, servingSizeGrams int32, grams int32, container *pb.Container, packaging []*pb.Packaging, containerSizeGrams int32, discountPercent int32, save bool) (*pb.RecipeDetails, error) {
	recipe := doc.GetProto().(*pb.Recipe)
	if recipe == nil {
		return nil, fmt.Errorf("Error bad recipe: %v\n", doc)
	}
	retval := &pb.RecipeDetails{
		Time:               ptypes.TimestampNow(),
		Recipe:             recipe,
		ServingSizeGrams:   servingSizeGrams,
		TotalGrams:         grams,
		Container:          container,
		ContainerSizeGrams: containerSizeGrams,
		DiscountPercent:    discountPercent}

	rows := []*pb.IngredientDetails{}

	numServingsPerContainer := int32(math.Floor(float64(containerSizeGrams) / float64(servingSizeGrams)))

	for _, i := range recipe.GetProbiotics() {
		row, err := generateProbioticRow(
			ctx, servingSizeGrams, numServingsPerContainer, grams, discountPercent, recipe.GetProbioticOveragePercent(), i)
		if err != nil {
			return nil, err
		}
		rows = append(rows, row)
	}

	for _, i := range recipe.GetPrebiotics() {
		row, err := generatePrebioticRow(
			ctx, servingSizeGrams, numServingsPerContainer, grams, discountPercent, i)
		if err != nil {
			return nil, err
		}
		rows = append(rows, row)
	}

	for _, i := range recipe.GetPostbiotics() {
		row, err := generatePostbioticRow(
			ctx, servingSizeGrams, numServingsPerContainer, grams, discountPercent, i)
		if err != nil {
			return nil, err
		}
		rows = append(rows, row)
	}

	// Handle the packaging
	if container != nil {
		row, err := generatePackagingRow(
			ctx, servingSizeGrams, containerSizeGrams, grams, discountPercent, container.GetPackaging())
		if err != nil {
			return nil, err
		}
		rows = append(rows, row)
	}
	if packaging != nil && len(packaging) > 0 {
		for _, p := range packaging {
			row, err := generatePackagingRow(
				ctx, servingSizeGrams, containerSizeGrams, grams, discountPercent, p)
			if err != nil {
				return nil, err
			}
			rows = append(rows, row)
		}
	}
	retval.Ingredients = rows

	if save {
		db.GetSavedRecipesCollection().Create(ctx, retval)
	}

	return retval, nil
}

func PrintHeader() {
	fmt.Printf("| %30s | %12s | %12s | %12s | %12s | %12s | %12s | %12s | %12s |\n",
		"Name",
		"Stock CFU/g",
		"Percent",
		"PerServ (mg)",
		"Total (kg)",
		"CanBiocin Cost/kg",
		"CanBiocin CoGs/Container",
		"Total CanBiocin CoGs/Order",
		"Total Client CoGs/Order")
}

func Shrink(str string, size int) string {
	if len(str) <= size {
		return str
	}
	trailing := size - 10 - 3
	if trailing < 10 {
		return str
	}
	return fmt.Sprintf("%s...%s", str[0:10], str[len(str)-trailing:len(str)])
}

func RoundToPercision(f float64, percision int32) float64 {
	p := math.Pow(10, float64(percision))
	return math.Round(f*p) / p
}

const padding string = "____________"
const end string = "============"

func PrintRow(row *pb.IngredientDetails) {
	fmt.Printf("| %30s | %12s | %12s | %12s | %12s | %12s | %12s | %12s | %12s |\n", padding, padding, padding, padding, padding, padding, padding, padding, padding)

	var name string
	var stockCfu string
	if row.GetIngredient().GetProbiotic() != nil {
		name = row.GetIngredient().GetProbiotic().GetStrain()
		stockCfu = fmt.Sprintf("%v", row.GetIngredient().GetProbiotic().GetStockCfuG())
	} else if row.GetIngredient().GetPrebiotic() != nil {
		name = row.GetIngredient().GetPrebiotic().GetName()
	} else if row.GetIngredient().GetPostbiotic() != nil {
		name = row.GetIngredient().GetPostbiotic().GetName()
	}
	fmt.Printf("| %30s | %12s | %12s | %12s | %12s | %12s | %12s | %12s | %12s |\n",
		Shrink(name, 30),
		stockCfu,
		fmt.Sprintf("%v%%", RoundToPercision(row.GetPercent()*100, 5)),
		fmt.Sprintf("%v", RoundToPercision(row.GetPerservingMg(), 5)),
		fmt.Sprintf("%f", row.GetTotalGrams()/1000),
		utils.String(row.GetCbCostKg()),
		utils.String(row.GetCbCostPerContainer()),
		utils.String(row.GetCbTotal()),
		utils.String(row.GetClientTotal()))
}

func PrintTable(recipe *pb.RecipeDetails) {
	PrintHeader()
	sum := []float64{0.0, 0.0, 0.0, 0.0}
	sumMoney := []*pb.Money{&pb.Money{}, &pb.Money{}, &pb.Money{}}
	for _, row := range recipe.GetIngredients() {
		PrintRow(row)
		sum[0] += row.GetPercent()
		sum[1] += row.GetPerservingMg()
		sum[2] += row.GetTotalGrams() / 1000
		sumMoney[0] = utils.Add(sumMoney[0], row.GetCbCostPerContainer())
		sumMoney[1] = utils.Add(sumMoney[1], row.GetCbTotal())
		sumMoney[2] = utils.Add(sumMoney[2], row.GetClientTotal())
	}
	fmt.Printf("| %30s | %8s | %12s | %12s | %12s | %12s | %12s | %12s | %12s |\n", end, end, end, end, end, end, end, end, end)
	fmt.Printf("| %30s | %12s | %12s | %12s | %12s | %12s | %12s | %12s | %12s |\n",
		"Total",
		"",
		fmt.Sprintf("%v%%", RoundToPercision(sum[0]*100, 5)),
		fmt.Sprintf("%v", RoundToPercision(sum[1], 5)),
		fmt.Sprintf("%f", sum[2]),
		"",
		utils.String(sumMoney[0]),
		utils.String(sumMoney[1]),
		utils.String(sumMoney[2]))
}
