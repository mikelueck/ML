package db

import (
	"context"

	pb "github.com/ML/canbiocin/proto"
	"github.com/google/uuid"
	"google.golang.org/api/iterator"
)

const suppliersCollection = "suppliers"

// SuppliersCollection handles operations for the suppliers collection
type SuppliersCollection struct {
	BaseCollection[pb.Supplier, *SupplierDoc]
}

func (p *SuppliersCollection) adapt(pb *pb.Supplier) (*SupplierDoc, error) {
	if pb.GetId() == "" {
		pb.Id = uuid.New().String()
	}
	return NewSupplierDoc(pb)
}

// NewSuppliersCollection creates a new suppliers collection handler
func NewSuppliersCollection() *SuppliersCollection {
	c := &SuppliersCollection{
		BaseCollection: BaseCollection[pb.Supplier, *SupplierDoc]{
			collectionName: suppliersCollection,
		},
	}
	c.setAdapt(c.adapt)
	return c
}

// ListActive retrieves all active suppliers
func (sc *SuppliersCollection) ListActive(ctx context.Context) ([]*SupplierDoc, error) {
	iter, err := client.Query(ctx, sc.collectionName,
		[]*QueryCriteria{&QueryCriteria{
			Name:  "proto_bytes",
			Op:    "!=",
			Value: nil,
		}})
	if err != nil {
		return nil, err
	}
	defer iter.Stop()

	var docs []*SupplierDoc
	for {
		docWrapper := sc.getWrapper()
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
		pb := proto.(*pb.Supplier)
		if pb.GetIsActive() {
			docs = append(docs, docWrapper)
		}
	}
	return docs, nil
}

// ListByProductCategory retrieves suppliers that provide a specific product category
func (sc *SuppliersCollection) ListByProductCategory(ctx context.Context, category string) ([]*SupplierDoc, error) {
	iter, err := client.Query(ctx, sc.collectionName,
		[]*QueryCriteria{&QueryCriteria{
			Name:  "proto_bytes",
			Op:    "!=",
			Value: nil,
		}})
	if err != nil {
		return nil, err
	}
	defer iter.Stop()

	var docs []*SupplierDoc
	for {
		docWrapper := sc.getWrapper()
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
		pb := proto.(*pb.Supplier)
		for _, cat := range pb.GetProductCategories() {
			if cat == category {
				docs = append(docs, docWrapper)
				break
			}
		}
	}
	return docs, nil
}
