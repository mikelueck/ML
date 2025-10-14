package db

import (
	"context"

	pb "github.com/ML/canbiocin/proto"
	"github.com/google/uuid"
	"google.golang.org/api/iterator"
)

const savedRecipesCollection = "savedRecipes"

func init() {
	i := func() *SavedRecipesCollection {
		c := &SavedRecipesCollection{
			BaseCollection: BaseCollection[pb.RecipeDetails, *SavedRecipeDoc]{
				collectionName: savedRecipesCollection,
				defaultOrderBy: "date",
				defaultLimit:   10,
			},
		}
		c.setAdapt(c.adapt)
		return c
	}

	registry.Register(savedRecipesCollection, i())
}

// SavedRecipesCollection handles operations for the recipes collection
type SavedRecipesCollection struct {
	BaseCollection[pb.RecipeDetails, *SavedRecipeDoc]
}

func (p *SavedRecipesCollection) adapt(pb *pb.RecipeDetails) (*SavedRecipeDoc, error) {
	if pb.GetId() == "" {
		pb.Id = uuid.New().String()
	}
	return NewSavedRecipeDoc(pb)
}

// GetSavedRecipesCollection creates a new recipes collection handler
func GetSavedRecipesCollection() *SavedRecipesCollection {
	c := registry.Get(savedRecipesCollection)
	return c.(*SavedRecipesCollection)
}

func (pc *SavedRecipesCollection) QueryByRecipe(ctx context.Context, recipeId string) ([]*SavedRecipeDoc, error) {
	iter, err := client.Query(ctx, pc.collectionName,
		[]*QueryCriteria{&QueryCriteria{
			Name:  "recipe_id",
			Op:    "==",
			Value: recipeId,
		}}, pc.defaultOrderBy, pc.defaultLimit)
	if err != nil {
		return nil, err
	}
	defer iter.Stop()

	var docs []*SavedRecipeDoc
	for {
		docWrapper := pc.getWrapper()
		err := iter.Next(docWrapper)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		if docWrapper.GetRecipeID() == recipeId {
			docs = append(docs, docWrapper)
		}
	}
	return docs, nil
}

func (pc *SavedRecipesCollection) DeleteByRecipe(ctx context.Context, recipeId string) error {
	iter, err := client.Query(ctx, pc.collectionName,
		[]*QueryCriteria{&QueryCriteria{
			Name:  "recipe_id",
			Op:    "==",
			Value: recipeId,
		}}, pc.defaultOrderBy, -1)
	if err != nil {
		return err
	}
	defer iter.Stop()

	// TODO should implement a batch mechanism
	//batch := client.Batch()

	for {
		docWrapper := pc.getWrapper()
		err := iter.Next(docWrapper)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return err
		}
		pc.Delete(ctx, docWrapper.GetID())
	}
	return nil
}
