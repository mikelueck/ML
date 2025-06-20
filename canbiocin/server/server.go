package main

import (
	"context"
	"flag"
	"fmt"

	"github.com/ML/canbiocin/db"
	pb "github.com/ML/canbiocin/proto"
	recipeTools "github.com/ML/canbiocin/recipe"
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
	spp, err := db.GetProbioticsCollection().GetSppList(ctx)
	return &pb.ListProbioticSppResponse{Spps: spp}, err
}

func (s *server) ListPrebioticCategory(ctx context.Context, req *pb.ListPrebioticCategoryRequest) (*pb.ListPrebioticCategoryResponse, error) {
	category, err := db.GetPrebioticsCollection().GetCategoryList(ctx)
	return &pb.ListPrebioticCategoryResponse{Categories: category}, err
}

func (s *server) CreateRecipe(ctx context.Context, req *pb.CreateRecipeRequest) (*pb.CreateRecipeResponse, error) {
	id, err := db.GetRecipesCollection().Create(ctx, req.GetRecipe())
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	return &pb.CreateRecipeResponse{Id: id}, nil
}

func (s *server) GetRecipe(ctx context.Context, req *pb.GetRecipeRequest) (*pb.GetRecipeResponse, error) {
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
	err := db.GetRecipesCollection().Update(ctx, req.GetRecipe())
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	return nil, nil
}

func (s *server) ListRecipes(ctx context.Context, req *pb.ListRecipesRequest) (*pb.ListRecipesResponse, error) {
	var recipeList []*db.RecipeDoc
	var err error
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
	err := db.GetRecipesCollection().Delete(ctx, req.GetId())

	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}

	return &pb.DeleteRecipeResponse{}, nil
}

func (s *server) CalculateRecipe(ctx context.Context, req *pb.CalculateRecipeRequest) (*pb.CalculateRecipeResponse, error) {
	recipe, err := db.GetRecipesCollection().Get(ctx, req.GetRecipeId())
	if err != nil {
		return nil, status.Error(codes.NotFound, err.Error())
	}
	details, err := recipeTools.ComputeQuantities(ctx, recipe, req.GetServingSizeGrams(), req.GetTotalGrams())
	if err != nil {
		return nil, status.Error(codes.Unknown, err.Error())
	}
	return &pb.CalculateRecipeResponse{RecipeDetails: details}, nil
}
