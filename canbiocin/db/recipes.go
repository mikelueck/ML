package db

import (
	"context"

	pb "github.com/ML/canbiocin/proto"
	"github.com/google/uuid"
	"google.golang.org/api/iterator"
)

const recipesCollection = "recipes"

func init() {
	i := func() *RecipesCollection {
		c := &RecipesCollection{
			BaseCollection: BaseCollection[pb.Recipe, *RecipeDoc]{
				collectionName: recipesCollection,
			},
		}
		c.setAdapt(c.adapt)
		return c
	}

	registry.Register(recipesCollection, i())
}

// RecipesCollection handles operations for the recipes collection
type RecipesCollection struct {
	BaseCollection[pb.Recipe, *RecipeDoc]
}

func (p *RecipesCollection) adapt(pb *pb.Recipe) (*RecipeDoc, error) {
	if pb.GetId() == "" {
		pb.Id = uuid.New().String()
	}
	return NewRecipeDoc(pb)
}

// GetRecipesCollection creates a new recipes collection handler
func GetRecipesCollection() *RecipesCollection {
	c := registry.Get(recipesCollection)
	return c.(*RecipesCollection)
}

const packagingAndMillingCollection = "packaging_and_milling"

// PackagingAndMillingCollection handles operations for the packaging and milling collection
type PackagingAndMillingCollection struct {
	BaseCollection[pb.Recipe, *RecipeDoc]
}

func (p *PackagingAndMillingCollection) adapt(pb *pb.Recipe) (*RecipeDoc, error) {
	if pb.GetId() == "" {
		pb.Id = uuid.New().String()
	}
	return NewRecipeDoc(pb)
}

// NewPackagingAndMillingCollection creates a new packaging and milling collection handler
func NewPackagingAndMillingCollection() *PackagingAndMillingCollection {
	c := &PackagingAndMillingCollection{
		BaseCollection: BaseCollection[pb.Recipe, *RecipeDoc]{
			collectionName: packagingAndMillingCollection,
		},
	}
	c.setAdapt(c.adapt)
	return c
}

func (pc *RecipesCollection) QueryByCompanyAndName(ctx context.Context, company string, name string) ([]*RecipeDoc, error) {
	iter, err := client.Query(ctx, pc.collectionName,
		[]*QueryCriteria{&QueryCriteria{
			Name:  "name",
			Op:    "==",
			Value: name,
		}})
	if err != nil {
		return nil, err
	}
	defer iter.Stop()

	var docs []*RecipeDoc
	for {
		docWrapper := pc.getWrapper()
		err := iter.Next(docWrapper)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		if docWrapper.GetName() == name && docWrapper.GetCompany() == company {
			docs = append(docs, docWrapper)
		}
	}
	return docs, nil
}

func (pc *RecipesCollection) QueryByIngredient(ctx context.Context, ingredientId string) ([]*RecipeDoc, error) {
	iter, err := client.List(ctx, pc.collectionName)
	if err != nil {
		return nil, err
	}
	defer iter.Stop()

	var docs []*RecipeDoc
	for {
		docWrapper := pc.getWrapper()
		err := iter.Next(docWrapper)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}
    recipe := docWrapper.GetProto().(*pb.Recipe)
    // Look through all the recipes to find ingredient
    for _, ingredient := range recipe.GetProbiotics() {
      if ingredient.GetItem() == ingredientId {
        docs = append(docs, docWrapper)
      }
    }
    for _, ingredient := range recipe.GetPrebiotics() {
      if ingredient.GetItem() == ingredientId {
        docs = append(docs, docWrapper)
      }
    }
    for _, ingredient := range recipe.GetPostbiotics() {
      if ingredient.GetItem() == ingredientId {
        docs = append(docs, docWrapper)
      }
    }
	}
	return docs, nil
}
