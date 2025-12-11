package db

import (
	"context"

	pb "github.com/ML/canbiocin/proto"
	"github.com/google/uuid"
	"google.golang.org/api/iterator"
)

const shippingCollection = "shipping"

func init() {
	i := func() *ShippingCollection {
		c := &ShippingCollection{
			BaseCollection: BaseCollection[pb.Shipping, *ShippingDoc]{
				collectionName: shippingCollection,
				defaultOrderBy: "name",
				defaultLimit:   -1,
			},
		}
		c.setAdapt(c.adapt)
		return c
	}

	registry.Register(shippingCollection, i())
}

// ShippingCollection handles operations for the shipping collection
type ShippingCollection struct {
	BaseCollection[pb.Shipping, *ShippingDoc]
}

func (p *ShippingCollection) adapt(pb *pb.Shipping) (*ShippingDoc, error) {
	if pb.GetId() == "" {
		pb.Id = uuid.New().String()
	}
	return NewShippingDoc(pb)
}

// GetShippingCollection creates a new shipping collection handler
func GetShippingCollection() *ShippingCollection {
	c := registry.Get(shippingCollection)
	return c.(*ShippingCollection)
}

func (pc *ShippingCollection) QueryByName(ctx context.Context, name string) ([]*ShippingDoc, error) {
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

	var docs []*ShippingDoc
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

func (pc *ShippingCollection) QueryByContainer(ctx context.Context, c *pb.Container) ([]*ShippingDoc, error) {
	var docs []*ShippingDoc

	iter, err := client.List(ctx, pc.collectionName, pc.defaultOrderBy, pc.defaultLimit)
	if err != nil {
		return nil, err
	}
	defer iter.Stop()

	options := make(map[string]int)

	for _, option := range c.GetShippingOptions() {
		options[option.GetShippingId()] = 1
	}

	for {
		docWrapper := pc.getWrapper()
		err := iter.Next(docWrapper)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		_, ok := options[docWrapper.GetID()]
		if ok {
			docs = append(docs, docWrapper)
		}
	}
	return docs, nil
}
