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

const probioticsCollection = "probiotics"

func init() {
	i := func() *ProbioticsCollection {
		c := &ProbioticsCollection{
			BaseCollection: BaseCollection[pb.Probiotic, *ProbioticDoc]{
				collectionName: probioticsCollection,
			},
			probioticSpp: []string{},
		}
		c.setAdapt(c.adapt)
		c.SetSppList(context.Background())
		return c
	}

	registry.Register(probioticsCollection, i())
}

// ProbioticsCollection handles operations for the prebiotics collection
type ProbioticsCollection struct {
	BaseCollection[pb.Probiotic, *ProbioticDoc]

	// We keep a list of all the Spp associated with the Probiotics so we can
	// quickly populate dropdowns on the client
	lock         sync.RWMutex
	probioticSpp []string
}

func (b *ProbioticsCollection) SetSppList(ctx context.Context) {
	b.lock.Lock()
	defer b.lock.Unlock()

	docs, _ := b.List(ctx)

	spp := make(map[string]bool)

	for _, p := range docs {
		spp[p.GetSpp()] = true
	}

	b.probioticSpp = slices.Sorted(maps.Keys(spp))
}

func (b *ProbioticsCollection) GetSppList(ctx context.Context) ([]string, error) {
	b.lock.RLock()
	defer b.lock.RUnlock()

	return b.probioticSpp, nil
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
