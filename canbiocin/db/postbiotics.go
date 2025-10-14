package db

import (
	"context"

	pb "github.com/ML/canbiocin/proto"
	"github.com/google/uuid"
	"google.golang.org/api/iterator"
)

const postbioticsCollection = "postbiotics"

func init() {
	i := func() *PostbioticsCollection {
		c := &PostbioticsCollection{
			BaseCollection: BaseCollection[pb.Postbiotic, *PostbioticDoc]{
				collectionName: postbioticsCollection,
				defaultOrderBy: "name",
				defaultLimit:   -1,
			},
		}
		c.setAdapt(c.adapt)
		return c
	}

	registry.Register(postbioticsCollection, i())
}

// PostbioticsCollection handles operations for the postbiotics collection
type PostbioticsCollection struct {
	BaseCollection[pb.Postbiotic, *PostbioticDoc]
}

func (p *PostbioticsCollection) adapt(pb *pb.Postbiotic) (*PostbioticDoc, error) {
	if pb.GetId() == "" {
		pb.Id = uuid.New().String()
	}
	return NewPostbioticDoc(pb)
}

// GetPostbioticsCollection creates a new postbiotics collection handler
func GetPostbioticsCollection() *PostbioticsCollection {
	c := registry.Get(postbioticsCollection)
	return c.(*PostbioticsCollection)
}

func (pc *PostbioticsCollection) QueryByName(ctx context.Context, name string) ([]*PostbioticDoc, error) {
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

	var docs []*PostbioticDoc
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

// QueryByBagSize retrieves postbiotics by bag size
func (pc *PostbioticsCollection) QueryByBagSize(ctx context.Context, bagSize int32) ([]*PostbioticDoc, error) {
	iter, err := client.Query(ctx, pc.collectionName,
		[]*QueryCriteria{&QueryCriteria{
			Name:  "proto_bytes",
			Op:    "!=",
			Value: nil,
		}}, pc.defaultOrderBy, pc.defaultLimit)
	if err != nil {
		return nil, err
	}
	defer iter.Stop()

	var docs []*PostbioticDoc
	for {
		docWrapper := pc.getWrapper()
		err := iter.Next(docWrapper)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		proto := docWrapper.GetProto()
		if proto == nil {
			continue
		}
		pb := proto.(*pb.Postbiotic)
		if pb.GetBagSizeKg() == bagSize {
			docs = append(docs, docWrapper)
		}
	}
	return docs, nil
}
