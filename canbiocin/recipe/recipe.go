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

func getStock(p *pb.Probiotic, isMe bool) float64 {
  if isMe {
    return p.GetMeBCfuG() 
  } else {
    return p.GetStockBCfuG()
  }
}

func getCost(p *pb.Probiotic, isMe bool) *pb.Money {
  if isMe {
    return utils.Add(utils.Mult(p.GetCostKg(), p.GetKgPerMeKg()), p.GetCostOfMe())
  } else {
    return p.GetCostKg()
  }

}

func generateProbioticRow(
	ctx context.Context,
	servingSizeGrams int32,
	numServingsPerContainer int32,
	grams int32,
	targetMargin int32,
	currencyRate float64,
	overagePercent int32,
	item *pb.ProbioticIngredient) (*pb.IngredientDetails, error) {
	// the stock probiotics are more concentrated so need to be diluted
	probioticDoc, err := db.GetProbioticsCollection().Get(ctx, item.GetItem())
	if err != nil {
		return nil, err
	}
	probiotic := probioticDoc.GetProto().(*pb.Probiotic)

  isMe := item.GetIsMe()

	percent := float64(item.GetBCfuG()) / getStock(probiotic, isMe)
	perserving := float64(servingSizeGrams) * percent
	overage_factor := (1 + float64(overagePercent)/100)
	total := float64(grams) * percent * overage_factor
	cbCostKg := getCost(probiotic, isMe)
	cbTotal := utils.Mult(cbCostKg, total/1000)
	cbCostPerContainer := utils.Mult(utils.Div(cbCostKg, 1000), float64(numServingsPerContainer)*float64(perserving*overage_factor))
	margin := float64(100-targetMargin) / float64(100)
	clientCostPerContainer := utils.Div(cbCostPerContainer, margin)
	clientTotal := utils.Div(cbTotal, margin)

	row := &pb.IngredientDetails{
		Ingredient:             &pb.Ingredient{Item: &pb.Ingredient_Probiotic{Probiotic: probiotic}},
		DesiredBCfuG:           item.GetBCfuG(),
    IsMe:                   isMe,
		Percent:                percent,
		PerservingMg:           perserving * 1000.0,
		TotalGrams:             total,
		CbCostKg:               cbCostKg,
		CbCostPerContainer:     cbCostPerContainer,
		ClientCostPerContainer: clientCostPerContainer,
		CbTotal:                cbTotal,
		ClientTotal:            clientTotal,
		ClientTotalCurrency:    utils.Mult(clientTotal, currencyRate),
	}
	return row, nil
}

func generatePrebioticRow(
	ctx context.Context,
	servingSizeGrams int32,
	numServingsPerContainer int32,
	grams int32,
	targetMargin int32,
	currencyRate float64,
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
	margin := float64(100-targetMargin) / float64(100)
	clientCostPerContainer := utils.Div(cbCostPerContainer, margin)
	clientTotal := utils.Div(cbTotal, margin)

	row := &pb.IngredientDetails{
		Ingredient:             &pb.Ingredient{Item: &pb.Ingredient_Prebiotic{Prebiotic: prebiotic}},
		Percent:                percent,
		PerservingMg:           perserving,
		TotalGrams:             total,
		CbCostKg:               cbCostKg,
		CbCostPerContainer:     cbCostPerContainer,
		ClientCostPerContainer: clientCostPerContainer,
		CbTotal:                cbTotal,
		ClientTotal:            clientTotal,
		ClientTotalCurrency:    utils.Mult(clientTotal, currencyRate),
	}
	return row, nil
}

func generatePostbioticRow(
	ctx context.Context,
	servingSizeGrams int32,
	numServingsPerContainer int32,
	grams int32,
	targetMargin int32,
	currencyRate float64,
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
	margin := float64(100-targetMargin) / float64(100)
	clientCostPerContainer := utils.Div(cbCostPerContainer, margin)
	clientTotal := utils.Div(cbTotal, margin)

	row := &pb.IngredientDetails{
		Ingredient:             &pb.Ingredient{Item: &pb.Ingredient_Postbiotic{Postbiotic: postbiotic}},
		Percent:                percent,
		PerservingMg:           perserving,
		TotalGrams:             total,
		CbCostKg:               cbCostKg,
		CbCostPerContainer:     cbCostPerContainer,
		ClientCostPerContainer: clientCostPerContainer,
		CbTotal:                cbTotal,
		ClientTotal:            clientTotal,
		ClientTotalCurrency:    utils.Mult(clientTotal, currencyRate),
	}
	return row, nil
}

func generatePackagingRow(
	ctx context.Context,
	servingSizeGrams int32,
	containerSizeGrams int32,
	grams int32,
	targetMargin int32,
	currencyRate float64,
	packaging *pb.Packaging) (*pb.IngredientDetails, error) {
	servingsPerContainer := int32(math.Floor(float64(containerSizeGrams) / float64(servingSizeGrams)))

	totalCost := packaging.GetTotalCost()
	unitsPerPackage := packaging.GetUnitsPackage()
	cbCostPerContainer := utils.Div(totalCost, float64(unitsPerPackage))
	numContainers := math.Ceil(float64(grams) / float64(servingsPerContainer*servingSizeGrams))

	cbTotal := utils.Mult(cbCostPerContainer, numContainers)
	margin := float64(100-targetMargin) / float64(100)
	clientCostPerContainer := utils.Div(cbCostPerContainer, margin)
	clientTotal := utils.Div(cbTotal, margin)

	row := &pb.IngredientDetails{
		Ingredient:             &pb.Ingredient{Item: &pb.Ingredient_Packaging{Packaging: packaging}},
		TotalGrams:             numContainers,
		CbCostPerContainer:     cbCostPerContainer,
		ClientCostPerContainer: clientCostPerContainer,
		CbTotal:                cbTotal,
		ClientTotal:            clientTotal,
		ClientTotalCurrency:    utils.Mult(clientTotal, currencyRate),
	}
	return row, nil
}

func generateBlendingRow(
	ctx context.Context,
	servingSizeGrams int32,
	containerSizeGrams int32,
	grams int32,
	count int32,
	targetMargin int32,
	currencyRate float64,
	blending *pb.Milling_Blending_Packaging) (*pb.IngredientDetails, error) {

	servingsPerContainer := int32(math.Floor(float64(containerSizeGrams) / float64(servingSizeGrams)))

	cbTotal := utils.Mult(blending.GetCost(), float64(count))

	numContainers := math.Ceil(float64(grams) / float64(servingsPerContainer*servingSizeGrams))
	cbCostPerContainer := utils.Div(cbTotal, numContainers)

	margin := float64(100-targetMargin) / float64(100)
	clientCostPerContainer := utils.Div(cbCostPerContainer, margin)
	clientTotal := utils.Div(cbTotal, margin)

	row := &pb.IngredientDetails{
		Ingredient:             &pb.Ingredient{Item: &pb.Ingredient_Blending{Blending: blending}},
		TotalGrams:             float64(count),
		CbCostPerContainer:     cbCostPerContainer,
		ClientCostPerContainer: clientCostPerContainer,
		CbTotal:                cbTotal,
		ClientTotal:            clientTotal,
		ClientTotalCurrency:    utils.Mult(clientTotal, currencyRate),
	}
	return row, nil
}

// Given a recipe and number of grams required outputs number of milligrams for each ingredient
func ComputeQuantities(
	ctx context.Context,
	doc *db.RecipeDoc,
	servingSizeGrams int32,
	grams int32,
	container *pb.Container,
	packaging []*pb.Packaging,
	containerSizeGrams int32,
	targetMargin int32,
	currencyRate float64,
	save bool) (*pb.RecipeDetails, error) {
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
		TargetMargin:       targetMargin,
		CurrencyRate:       currencyRate}

	rows := []*pb.IngredientDetails{}

	numServingsPerContainer := int32(math.Floor(float64(containerSizeGrams) / float64(servingSizeGrams)))

	for _, i := range recipe.GetProbiotics() {
		row, err := generateProbioticRow(
			ctx, servingSizeGrams, numServingsPerContainer, grams, targetMargin, currencyRate, recipe.GetProbioticOveragePercent(), i)
		if err != nil {
			return nil, err
		}
		rows = append(rows, row)
	}

	for _, i := range recipe.GetPrebiotics() {
		row, err := generatePrebioticRow(
			ctx, servingSizeGrams, numServingsPerContainer, grams, targetMargin, currencyRate, i)
		if err != nil {
			return nil, err
		}
		rows = append(rows, row)
	}

	for _, i := range recipe.GetPostbiotics() {
		row, err := generatePostbioticRow(
			ctx, servingSizeGrams, numServingsPerContainer, grams, targetMargin, currencyRate, i)
		if err != nil {
			return nil, err
		}
		rows = append(rows, row)
	}

	// Handle the packaging
	if container != nil {
		row, err := generatePackagingRow(
			ctx, servingSizeGrams, containerSizeGrams, grams, targetMargin, currencyRate, container.GetPackaging())
		if err != nil {
			return nil, err
		}
		rows = append(rows, row)
	}
	if packaging != nil && len(packaging) > 0 {
		for _, p := range packaging {
			row, err := generatePackagingRow(
				ctx, servingSizeGrams, containerSizeGrams, grams, targetMargin, currencyRate, p)
			if err != nil {
				return nil, err
			}
			rows = append(rows, row)
		}
	}

	// Handle the milling/blending/packaging
	// Might have to rent a room to mix and have additional labor
	// 100kg is 2 hours for 1 person
	// 2000 jars is 8 hours for 3 people
	var millingItems []*db.BlendingDoc
	var err error
	if grams >= 10000 { // have to rent a room
		millingItems, err = db.GetBlendingCollection().QueryByName(ctx, "Milling >10kg")
	} else {
		millingItems, err = db.GetBlendingCollection().QueryByName(ctx, "Milling <10kg")
	}
	if err != nil {
		return nil, err
	}

	if len(millingItems) != 1 {
		return nil, fmt.Errorf("Was expecting one milling ingredient but found: %d", len(millingItems))
	}

	milling := millingItems[0]

	row, err := generateBlendingRow(ctx, servingSizeGrams, containerSizeGrams, grams, 1, targetMargin, currencyRate, milling.GetProto().(*pb.Milling_Blending_Packaging))
	rows = append(rows, row)

	var hoursOfLabor int32
	hoursOfLabor += int32(math.Ceil(float64(grams) / 50000)) // one hour per 50kg milling

	numContainers := math.Ceil(float64(grams) / float64(containerSizeGrams))
	// Seems to be about 666 jars per person per 8 hrs
	// Maybe we say 85 jars per hour?
	hoursOfLabor += int32(math.Ceil(numContainers / 85))

	millingItems, err = db.GetBlendingCollection().QueryByName(ctx, "Labor")
	if err != nil {
		return nil, err
	}

	if len(millingItems) != 1 {
		return nil, fmt.Errorf("Was expecting one milling ingredient for 'Labor' but found: %d", len(millingItems))
	}

	milling = millingItems[0]

	row, err = generateBlendingRow(ctx, servingSizeGrams, containerSizeGrams, grams, hoursOfLabor, targetMargin, currencyRate, milling.GetProto().(*pb.Milling_Blending_Packaging))
	rows = append(rows, row)

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
	var stockBCfu string
	if row.GetIngredient().GetProbiotic() != nil {
		name = row.GetIngredient().GetProbiotic().GetStrain()
		stockBCfu = fmt.Sprintf("%v", row.GetIngredient().GetProbiotic().GetStockBCfuG())
	} else if row.GetIngredient().GetPrebiotic() != nil {
		name = row.GetIngredient().GetPrebiotic().GetName()
	} else if row.GetIngredient().GetPostbiotic() != nil {
		name = row.GetIngredient().GetPostbiotic().GetName()
	} else if row.GetIngredient().GetPackaging() != nil {
		name = row.GetIngredient().GetPackaging().GetName()
	} else if row.GetIngredient().GetBlending() != nil {
		name = row.GetIngredient().GetBlending().GetName()
	}
	fmt.Printf("| %30s | %12s | %12s | %12s | %12s | %12s | %12s | %12s | %12s | %12s |\n",
		Shrink(name, 30),
		stockBCfu,
		fmt.Sprintf("%v%%", RoundToPercision(row.GetPercent()*100, 5)),
		fmt.Sprintf("%v", RoundToPercision(row.GetPerservingMg(), 5)),
		fmt.Sprintf("%f", row.GetTotalGrams()/1000),
		utils.String(row.GetCbCostKg()),
		utils.String(row.GetCbCostPerContainer()),
		utils.String(row.GetCbTotal()),
		utils.String(row.GetClientTotal()),
		utils.String(row.GetClientTotalCurrency()))
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
