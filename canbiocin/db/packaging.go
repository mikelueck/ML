package db

import (
	"context"

	pb "github.com/ML/canbiocin/proto"
	"github.com/google/uuid"
	"google.golang.org/api/iterator"
)

const packagingCollection = "packaging"

func init() {
	i := func() *PackagingCollection {
		c := &PackagingCollection{
			BaseCollection: BaseCollection[pb.Packaging, *PackagingDoc]{
				collectionName: packagingCollection,
				defaultOrderBy: "name",
				defaultLimit:   -1,
			},
		}
		c.setAdapt(c.adapt)
		return c
	}

	registry.Register(packagingCollection, i())
}

// PackagingCollection handles operations for the packaging collection
type PackagingCollection struct {
	BaseCollection[pb.Packaging, *PackagingDoc]
}

func (p *PackagingCollection) adapt(pb *pb.Packaging) (*PackagingDoc, error) {
	if pb.GetId() == "" {
		pb.Id = uuid.New().String()
	}
	return NewPackagingDoc(pb)
}

// GetPackagingCollection creates a new packaging collection handler
func GetPackagingCollection() *PackagingCollection {
	c := registry.Get(packagingCollection)
	return c.(*PackagingCollection)
}

func (pc *PackagingCollection) QueryByName(ctx context.Context, name string) ([]*PackagingDoc, error) {
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

	var docs []*PackagingDoc
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
