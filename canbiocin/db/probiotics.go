package db

import (
	"context"

	pb "github.com/ML/canbiocin/proto"
	"github.com/google/uuid"
	"google.golang.org/api/iterator"
)

const probioticsCollection = "probiotics"

func init() {
	i := func() *ProbioticsCollection {
		c := &ProbioticsCollection{
			BaseCollection: BaseCollection[pb.Probiotic, *ProbioticDoc]{
				collectionName: probioticsCollection,
			},
		}
		c.setAdapt(c.adapt)
		return c
	}

	registry.Register(probioticsCollection, i())
}

// ProbioticsCollection handles operations for the prebiotics collection
type ProbioticsCollection struct {
	BaseCollection[pb.Probiotic, *ProbioticDoc]
}

func (p *ProbioticsCollection) adapt(pb *pb.Probiotic) (*ProbioticDoc, error) {
	if pb.GetId() == "" {
		pb.Id = uuid.New().String()
	}
	return NewProbioticDoc(pb)
}

// GetProbioticsCollection creates a new prebiotics collection handler
func GetProbioticsCollection() *ProbioticsCollection {
	c := registry.Get(probioticsCollection)
	return c.(*ProbioticsCollection)
}

func (pc *ProbioticsCollection) QueryByName(ctx context.Context, name string) ([]*ProbioticDoc, error) {
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

	var docs []*ProbioticDoc
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

// QueryBySupplier retrieves probiotics from a specific supplier
func (pc *ProbioticsCollection) QueryBySupplier(ctx context.Context, supplierID string) ([]*ProbioticDoc, error) {
	iter, err := client.Query(ctx, pc.collectionName,
		[]*QueryCriteria{&QueryCriteria{
			Name:  "proto_bytes",
			Op:    "!=",
			Value: nil,
		}})
	if err != nil {
		return nil, err
	}
	defer iter.Stop()

	var docs []*ProbioticDoc
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
		pb := proto.(*pb.Probiotic)
		if pb.Supplier != nil && pb.Supplier.Id == supplierID {
			docs = append(docs, docWrapper)
		}
	}
	return docs, nil
}
