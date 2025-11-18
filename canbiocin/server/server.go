package main

import (
	"context"
	"flag"
	"fmt"
	"time"

	"github.com/ML/canbiocin/db"
	pb "github.com/ML/canbiocin/proto"
	recipeTools "github.com/ML/canbiocin/recipe"
	"github.com/golang/protobuf/ptypes"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

var (
	grpcport = flag.String("grpcport", ":8082", "grpcport")
)

// implementation of CanbiocinService
type server struct{}

func (s *server) CreateIngredient(ctx context.Context, req *pb.CreateIngredientRequest) (*pb.CreateIngredientResponse, error) {
	var err error
	var id string

	err = checkClaimsForMethod(ctx, "CreateIngredient")
	if err != nil {
		return nil, err
	}

	if req.GetIngredient().GetProbiotic() != nil {
		id, err = db.GetProbioticsCollection().Create(ctx, req.GetIngredient().GetProbiotic())
	}
	if req.GetIngredient().GetPrebiotic() != nil {
		id, err = db.GetPrebioticsCollection().Create(ctx, req.GetIngredient().GetPrebiotic())
	}
	if req.GetIngredient().GetPostbiotic() != nil {
		id, err = db.GetPostbioticsCollection().Create(ctx, req.GetIngredient().GetPostbiotic())
	}
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	return &pb.CreateIngredientResponse{Id: id}, nil
}

func (s *server) GetIngredient(ctx context.Context, req *pb.GetIngredientRequest) (*pb.GetIngredientResponse, error) {
	var reterr error
	var i *pb.Ingredient

	err := checkClaimsForMethod(ctx, "GetIngredient")
	if err != nil {
		return nil, err
	}

	if req.GetType() == "probiotic" {
		doc, err := db.GetProbioticsCollection().Get(ctx, req.GetId())
		if err == nil {
			i = &pb.Ingredient{Item: &pb.Ingredient_Probiotic{Probiotic: doc.GetProto().(*pb.Probiotic)}}
		} else {
			reterr = status.Error(codes.NotFound, err.Error())
		}
	} else if req.GetType() == "prebiotic" {
		doc, err := db.GetPrebioticsCollection().Get(ctx, req.GetId())
		if err == nil {
			i = &pb.Ingredient{Item: &pb.Ingredient_Prebiotic{Prebiotic: doc.GetProto().(*pb.Prebiotic)}}
		} else {
			reterr = status.Error(codes.NotFound, err.Error())
		}
	} else if req.GetType() == "postbiotic" {
		doc, err := db.GetPostbioticsCollection().Get(ctx, req.GetId())
		if err == nil {
			i = &pb.Ingredient{Item: &pb.Ingredient_Postbiotic{Postbiotic: doc.GetProto().(*pb.Postbiotic)}}
		} else {
			reterr = status.Error(codes.NotFound, err.Error())
		}
	}

	if i != nil {
		return &pb.GetIngredientResponse{Ingredient: i}, nil
	}
	return nil, reterr

}

func (s *server) UpdateIngredient(ctx context.Context, req *pb.UpdateIngredientRequest) (*pb.UpdateIngredientResponse, error) {
	var err error

	err = checkClaimsForMethod(ctx, "UpdateIngredient")
	if err != nil {
		return nil, err
	}

	if req.GetIngredient().GetProbiotic() != nil {
		err = db.GetProbioticsCollection().Update(ctx, req.GetIngredient().GetProbiotic())
	}
	if req.GetIngredient().GetPrebiotic() != nil {
		err = db.GetPrebioticsCollection().Update(ctx, req.GetIngredient().GetPrebiotic())
	}
	if req.GetIngredient().GetPostbiotic() != nil {
		err = db.GetPostbioticsCollection().Update(ctx, req.GetIngredient().GetPostbiotic())
	}
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	return nil, nil
}

func (s *server) DeleteIngredient(ctx context.Context, req *pb.DeleteIngredientRequest) (*pb.DeleteIngredientResponse, error) {
	var err error

	err = checkClaimsForMethod(ctx, "DeleteIngredient")
	if err != nil {
		return nil, err
	}

	recipes, err := db.GetRecipesCollection().QueryByIngredient(ctx, req.GetId())
	if err == nil && len(recipes) == 0 {
		if req.GetType() == "probiotic" {
			err = db.GetProbioticsCollection().Delete(ctx, req.GetId())
		} else if req.GetType() == "prebiotic" {
			err = db.GetPrebioticsCollection().Delete(ctx, req.GetId())
		} else if req.GetType() == "postbiotic" {
			err = db.GetPostbioticsCollection().Delete(ctx, req.GetId())
		}
	} else {
		return nil, status.Error(codes.FailedPrecondition,
			fmt.Sprintf("Can't delete this ingredient as it is being used by %d recipes", len(recipes)))
	}

	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}

	return &pb.DeleteIngredientResponse{}, nil
}

func (s *server) ListIngredients(ctx context.Context, req *pb.ListIngredientsRequest) (*pb.ListIngredientsResponse, error) {

	err := checkClaimsForMethod(ctx, "ListIngredients")
	if err != nil {
		return nil, err
	}

	ingredients := []*pb.Ingredient{}

	probioticsList, err := db.GetProbioticsCollection().List(ctx)
	if err == nil {
		for _, item := range probioticsList {
			proto := item.GetProto()
			if proto == nil {
				continue
			}
			p := proto.(*pb.Probiotic)
			ingredients = append(ingredients, &pb.Ingredient{Item: &pb.Ingredient_Probiotic{Probiotic: p}})
		}
	}

	prebioticsList, err := db.GetPrebioticsCollection().List(ctx)
	if err == nil {
		for _, item := range prebioticsList {
			proto := item.GetProto()
			if proto == nil {
				continue
			}
			p := proto.(*pb.Prebiotic)
			ingredients = append(ingredients, &pb.Ingredient{Item: &pb.Ingredient_Prebiotic{Prebiotic: p}})
		}
	}

	postbioticsList, err := db.GetPostbioticsCollection().List(ctx)
	if err == nil {
		for _, item := range postbioticsList {
			proto := item.GetProto()
			if proto == nil {
				continue
			}
			p := proto.(*pb.Postbiotic)
			ingredients = append(ingredients, &pb.Ingredient{Item: &pb.Ingredient_Postbiotic{Postbiotic: p}})
		}
	}
	resp := &pb.ListIngredientsResponse{Ingredients: ingredients}
	return resp, nil
}

func (s *server) ListProbioticSpp(ctx context.Context, req *pb.ListProbioticSppRequest) (*pb.ListProbioticSppResponse, error) {
	err := checkClaimsForMethod(ctx, "ListProbioticSpp")
	if err != nil {
		return nil, err
	}

	spp, err := db.GetProbioticsCollection().GetSppList(ctx)
	return &pb.ListProbioticSppResponse{Spps: spp}, err
}

func (s *server) ListPrebioticCategory(ctx context.Context, req *pb.ListPrebioticCategoryRequest) (*pb.ListPrebioticCategoryResponse, error) {
	err := checkClaimsForMethod(ctx, "ListPrebioticCategory")
	if err != nil {
		return nil, err
	}

	category, err := db.GetPrebioticsCollection().GetCategoryList(ctx)
	return &pb.ListPrebioticCategoryResponse{Categories: category}, err
}

func (s *server) CreateRecipe(ctx context.Context, req *pb.CreateRecipeRequest) (*pb.CreateRecipeResponse, error) {
	err := checkClaimsForMethod(ctx, "CreateRecipe")
	if err != nil {
		return nil, err
	}

	id, err := db.GetRecipesCollection().Create(ctx, req.GetRecipe())
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	return &pb.CreateRecipeResponse{Id: id}, nil
}

func (s *server) GetRecipe(ctx context.Context, req *pb.GetRecipeRequest) (*pb.GetRecipeResponse, error) {
	err := checkClaimsForMethod(ctx, "GetRecipe")
	if err != nil {
		return nil, err
	}

	r, err := db.GetRecipesCollection().Get(ctx, req.GetId())
	if err != nil {
		return nil, status.Error(codes.NotFound, err.Error())
	}
	recipe := r.GetProto().(*pb.Recipe)
	probiotics := []*pb.Probiotic{}
	for _, p := range recipe.GetProbiotics() {
		i, err := db.GetProbioticsCollection().Get(ctx, p.GetItem())
		if err != nil {
			return nil, status.Error(codes.NotFound, fmt.Sprintf("Error getting ingredient: %v, %v\n", p.GetItem(), err))
		}
		probiotics = append(probiotics, i.GetProto().(*pb.Probiotic))
	}
	prebiotics := []*pb.Prebiotic{}
	for _, p := range recipe.GetPrebiotics() {
		i, err := db.GetPrebioticsCollection().Get(ctx, p.GetItem())
		if err != nil {
			return nil, status.Error(codes.NotFound, fmt.Sprintf("Error getting ingredient: %v, %v\n", p.GetItem(), err))
		}
		prebiotics = append(prebiotics, i.GetProto().(*pb.Prebiotic))
	}
	postbiotics := []*pb.Postbiotic{}
	for _, p := range recipe.GetPostbiotics() {
		i, err := db.GetPostbioticsCollection().Get(ctx, p.GetItem())
		if err != nil {
			return nil, status.Error(codes.NotFound, fmt.Sprintf("Error getting ingredient: %v, %v\n", p.GetItem(), err))
		}
		postbiotics = append(postbiotics, i.GetProto().(*pb.Postbiotic))
	}

	return &pb.GetRecipeResponse{
		Recipe:      r.GetProto().(*pb.Recipe),
		Probiotics:  probiotics,
		Prebiotics:  prebiotics,
		Postbiotics: postbiotics}, nil
}

func (s *server) UpdateRecipe(ctx context.Context, req *pb.UpdateRecipeRequest) (*pb.UpdateRecipeResponse, error) {
	err := checkClaimsForMethod(ctx, "UpdateRecipe")
	if err != nil {
		return nil, err
	}

	err = db.GetRecipesCollection().Update(ctx, req.GetRecipe())
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	return nil, nil
}

func (s *server) ListRecipes(ctx context.Context, req *pb.ListRecipesRequest) (*pb.ListRecipesResponse, error) {
	var recipeList []*db.RecipeDoc
	var err error

	err = checkClaimsForMethod(ctx, "ListRecipes")
	if err != nil {
		return nil, err
	}

	if req.GetIngredientId() == "" {
		recipeList, err = db.GetRecipesCollection().List(ctx)
	} else {
		recipeList, err = db.GetRecipesCollection().QueryByIngredient(ctx, req.GetIngredientId())
	}
	recipes := []*pb.Recipe{}
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	for _, item := range recipeList {
		proto := item.GetProto()
		if proto == nil {
			continue
		}
		r := proto.(*pb.Recipe)
		recipes = append(recipes, r)
	}
	return &pb.ListRecipesResponse{Recipes: recipes}, nil
}

func (s *server) DeleteRecipe(ctx context.Context, req *pb.DeleteRecipeRequest) (*pb.DeleteRecipeResponse, error) {
	err := checkClaimsForMethod(ctx, "DeleteRecipe")
	if err != nil {
		return nil, err
	}

	err = db.GetRecipesCollection().Delete(ctx, req.GetId())

	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}

	return &pb.DeleteRecipeResponse{}, nil
}

func (s *server) CalculateRecipe(ctx context.Context, req *pb.CalculateRecipeRequest) (*pb.CalculateRecipeResponse, error) {
	err := checkClaimsForMethod(ctx, "CalculateRecipe")
	if err != nil {
		return nil, err
	}

	recipe, err := db.GetRecipesCollection().Get(ctx, req.GetRecipeId())
	if err != nil {
		return nil, status.Error(codes.NotFound, err.Error())
	}
	details, err := recipeTools.ComputeQuantities(
		ctx,
		recipe,
		req.GetServingSizeGrams(),
		req.GetTotalGrams(),
		req.GetContainer(),
		req.GetPackaging(),
		req.GetContainerSizeGrams(),
		req.GetTargetMargin(),
		req.GetCurrencyRate(),
		false) // Don't save
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	return &pb.CalculateRecipeResponse{RecipeDetails: details}, nil
}

func (s *server) CreateContainer(ctx context.Context, req *pb.CreateContainerRequest) (*pb.CreateContainerResponse, error) {
	var err error
	var id string

	err = checkClaimsForMethod(ctx, "CreateContainer")
	if err != nil {
		return nil, err
	}

	id, err = db.GetContainersCollection().Create(ctx, req.GetContainer())
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	return &pb.CreateContainerResponse{Id: id}, nil
}

func (s *server) DeleteContainer(ctx context.Context, req *pb.DeleteContainerRequest) (*pb.DeleteContainerResponse, error) {

	err := checkClaimsForMethod(ctx, "DeleteContainer")
	if err != nil {
		return nil, err
	}

	err = db.GetContainersCollection().Delete(ctx, req.GetId())

	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}

	return &pb.DeleteContainerResponse{}, nil
}

func (s *server) UpdateContainer(ctx context.Context, req *pb.UpdateContainerRequest) (*pb.UpdateContainerResponse, error) {
	err := checkClaimsForMethod(ctx, "UpdateContainer")
	if err != nil {
		return nil, err
	}

	err = db.GetContainersCollection().Update(ctx, req.GetContainer())
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	return nil, nil
}

func (s *server) ListContainers(ctx context.Context, req *pb.ListContainersRequest) (*pb.ListContainersResponse, error) {
	var containerList []*db.ContainerDoc
	var err error

	err = checkClaimsForMethod(ctx, "ListContainers")
	if err != nil {
		return nil, err
	}

	containerList, err = db.GetContainersCollection().List(ctx)
	containers := []*pb.Container{}
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	for _, item := range containerList {
		proto := item.GetProto()
		if proto == nil {
			continue
		}
		c := proto.(*pb.Container)
		containers = append(containers, c)
	}
	return &pb.ListContainersResponse{Containers: containers}, nil
}

func (s *server) CreateSavedRecipe(ctx context.Context, req *pb.CreateSavedRecipeRequest) (*pb.CreateSavedRecipeResponse, error) {
	err := checkClaimsForMethod(ctx, "CreateSavedRecipe")
	if err != nil {
		return nil, err
	}

	recipe := req.GetRecipe()
	t, _ := ptypes.TimestampProto(time.Now())
	recipe.Time = t
	id, err := db.GetSavedRecipesCollection().Create(ctx, recipe)
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	return &pb.CreateSavedRecipeResponse{
		Id:   id,
		Time: recipe.GetTime(),
	}, nil
}

func (s *server) GetSavedRecipe(ctx context.Context, req *pb.GetSavedRecipeRequest) (*pb.GetSavedRecipeResponse, error) {
	err := checkClaimsForMethod(ctx, "GetSavedRecipe")
	if err != nil {
		return nil, err
	}

	r, err := db.GetSavedRecipesCollection().Get(ctx, req.GetSavedRecipeId())
	if err != nil {
		return nil, status.Error(codes.NotFound, err.Error())
	}

	return &pb.GetSavedRecipeResponse{
		Recipe: r.GetProto().(*pb.RecipeDetails),
	}, nil
}

func (s *server) UpdateSavedRecipe(ctx context.Context, req *pb.UpdateSavedRecipeRequest) (*pb.UpdateSavedRecipeResponse, error) {
	err := checkClaimsForMethod(ctx, "UpdateSavedRecipe")
	if err != nil {
		return nil, err
	}

	recipe := req.GetRecipe()
	t, _ := ptypes.TimestampProto(time.Now())
	recipe.Time = t
	err = db.GetSavedRecipesCollection().Update(ctx, recipe)
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	return &pb.UpdateSavedRecipeResponse{
		Time: recipe.Time,
	}, nil
}

func (s *server) ListSavedRecipes(ctx context.Context, req *pb.ListSavedRecipesRequest) (*pb.ListSavedRecipesResponse, error) {
	var recipeList []*db.SavedRecipeDoc
	var err error

	err = checkClaimsForMethod(ctx, "ListSavedRecipes")
	if err != nil {
		return nil, err
	}

	if req.GetRecipeId() == "" {
		recipeList, err = db.GetSavedRecipesCollection().List(ctx)
	} else {
		recipeList, err = db.GetSavedRecipesCollection().QueryByRecipe(ctx, req.GetRecipeId())
	}
	recipes := []*pb.RecipeDetails{}
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	for _, item := range recipeList {
		proto := item.GetProto()
		if proto == nil {
			continue
		}
		r := proto.(*pb.RecipeDetails)
		recipes = append(recipes, r)
	}
	return &pb.ListSavedRecipesResponse{Recipes: recipes}, nil
}

func (s *server) DeleteSavedRecipe(ctx context.Context, req *pb.DeleteSavedRecipeRequest) (*pb.DeleteSavedRecipeResponse, error) {
	var err error = nil

	err = checkClaimsForMethod(ctx, "DeleteSavedRecipe")
	if err != nil {
		return nil, err
	}

	if req.GetSavedRecipeId() != "" {
		err = db.GetSavedRecipesCollection().Delete(ctx, req.GetSavedRecipeId())
	} else if req.GetRecipeId() != "" {
		err = db.GetSavedRecipesCollection().DeleteByRecipe(ctx, req.GetRecipeId())
	}

	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}

	return &pb.DeleteSavedRecipeResponse{}, nil
}

func (s *server) CreatePackaging(ctx context.Context, req *pb.CreatePackagingRequest) (*pb.CreatePackagingResponse, error) {
	var err error
	var id string

	err = checkClaimsForMethod(ctx, "CreatePackaging")
	if err != nil {
		return nil, err
	}

	id, err = db.GetPackagingCollection().Create(ctx, req.GetPackaging())
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	return &pb.CreatePackagingResponse{Id: id}, nil
}

func (s *server) DeletePackaging(ctx context.Context, req *pb.DeletePackagingRequest) (*pb.DeletePackagingResponse, error) {
	err := checkClaimsForMethod(ctx, "DeletePackaging")
	if err != nil {
		return nil, err
	}

	err = db.GetPackagingCollection().Delete(ctx, req.GetId())

	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}

	return &pb.DeletePackagingResponse{}, nil
}

func (s *server) UpdatePackaging(ctx context.Context, req *pb.UpdatePackagingRequest) (*pb.UpdatePackagingResponse, error) {
	err := checkClaimsForMethod(ctx, "UpdatePackaging")
	if err != nil {
		return nil, err
	}

	err = db.GetPackagingCollection().Update(ctx, req.GetPackaging())
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	return nil, nil
}

func (s *server) ListPackaging(ctx context.Context, req *pb.ListPackagingRequest) (*pb.ListPackagingResponse, error) {
	var packagingList []*db.PackagingDoc
	var err error

	err = checkClaimsForMethod(ctx, "ListPackaging")
	if err != nil {
		return nil, err
	}

	packagingList, err = db.GetPackagingCollection().List(ctx)
	packaging := []*pb.Packaging{}
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	for _, item := range packagingList {
		proto := item.GetProto()
		if proto == nil {
			continue
		}
		p := proto.(*pb.Packaging)
		packaging = append(packaging, p)
	}
	return &pb.ListPackagingResponse{Packaging: packaging}, nil
}
