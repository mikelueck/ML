package db

import (
	"context"
	"maps"
	"slices"
	"sync"

	pb "github.com/ML/canbiocin/proto"
	"github.com/google/uuid"
	"google.golang.org/api/iterator"
)

const prebioticsCollection = "prebiotics"

func init() {
	i := func() *PrebioticsCollection {
		c := &PrebioticsCollection{
			BaseCollection: BaseCollection[pb.Prebiotic, *PrebioticDoc]{
				collectionName: prebioticsCollection,
				defaultOrderBy: "name",
				defaultLimit:   -1,
			},
			prebioticCategory: []string{},
		}
		c.setAdapt(c.adapt)
		c.SetCategoryList(context.Background())
		return c
	}

	registry.Register(prebioticsCollection, i())
}

// PrebioticsCollection handles operations for the postbiotics collection
type PrebioticsCollection struct {
	BaseCollection[pb.Prebiotic, *PrebioticDoc]

	// We keep a list of all the Categories associated with the Prebiotics so we can
	// quickly populate dropdowns on the client
	lock              sync.RWMutex
	prebioticCategory []string
}

func (b *PrebioticsCollection) SetCategoryList(ctx context.Context) {
	b.lock.Lock()
	defer b.lock.Unlock()

	docs, _ := b.List(ctx)

	category := make(map[string]bool)

	for _, p := range docs {
		category[p.GetCategory()] = true
	}

	b.prebioticCategory = slices.Sorted(maps.Keys(category))
}

func (b *PrebioticsCollection) GetCategoryList(ctx context.Context) ([]string, error) {
	b.lock.RLock()
	defer b.lock.RUnlock()

	return b.prebioticCategory, nil
}

func (p *PrebioticsCollection) adapt(pb *pb.Prebiotic) (*PrebioticDoc, error) {
	if pb.GetId() == "" {
		pb.Id = uuid.New().String()
	}
	return NewPrebioticDoc(pb)
}

// GetPrebioticsCollection creates a new postbiotics collection handler
func GetPrebioticsCollection() *PrebioticsCollection {
	c := registry.Get(prebioticsCollection)
	return c.(*PrebioticsCollection)
}

// QueryByName retrieves prebiotics by category
func (pc *PrebioticsCollection) QueryByName(ctx context.Context, name string) ([]*PrebioticDoc, error) {
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

	var docs []*PrebioticDoc
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

// QueryBySupplier retrieves prebiotics from a specific supplier
func (pc *PrebioticsCollection) QueryBySupplier(ctx context.Context, supplierID string) ([]*PrebioticDoc, error) {
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

	var docs []*PrebioticDoc
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
		pb := proto.(*pb.Prebiotic)
		if pb.Supplier != nil && pb.Supplier.Id == supplierID {
			docs = append(docs, docWrapper)
		}
	}
	return docs, nil
}
