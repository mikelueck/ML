package db

import (
	"context"

	pb "github.com/ML/canbiocin/proto"
	"github.com/google/uuid"
	"google.golang.org/api/iterator"
)

const blendingCollection = "blending"

func init() {
	i := func() *BlendingCollection {
		c := &BlendingCollection{
			BaseCollection: BaseCollection[pb.Milling_Blending_Packaging, *BlendingDoc]{
				collectionName: blendingCollection,
				defaultOrderBy: "name",
				defaultLimit:   -1,
			},
		}
		c.setAdapt(c.adapt)
		return c
	}

	registry.Register(blendingCollection, i())
}

// BlendingCollection handles operations for the blending collection
type BlendingCollection struct {
	BaseCollection[pb.Milling_Blending_Packaging, *BlendingDoc]
}

func (p *BlendingCollection) adapt(pb *pb.Milling_Blending_Packaging) (*BlendingDoc, error) {
	if pb.GetId() == "" {
		pb.Id = uuid.New().String()
	}
	return NewBlendingDoc(pb)
}

// GetBlendingCollection creates a new blending collection handler
func GetBlendingCollection() *BlendingCollection {
	c := registry.Get(blendingCollection)
	return c.(*BlendingCollection)
}

func (pc *BlendingCollection) QueryByName(ctx context.Context, name string) ([]*BlendingDoc, error) {
	iter, err := client.Query(ctx, pc.collectionName,
		[]*QueryCriteria{&QueryCriteria{
			Name:  "name",
			Op:    "==",
			Value: name,
		}}, pc.defaultOrderBy, pc.defaultLimit)
	if err != nil {
		return nil, err
	}
	defer iter.Stop()

	var docs []*BlendingDoc
	for {
		docWrapper := pc.getWrapper()
		err := iter.Next(docWrapper)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		if docWrapper.GetName() == name {
			docs = append(docs, docWrapper)
		}
	}
	return docs, nil
}
