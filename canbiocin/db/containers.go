package db

import (
	"context"

	pb "github.com/ML/canbiocin/proto"
	"github.com/google/uuid"
	"google.golang.org/api/iterator"
)

const containersCollection = "containers"

func init() {
	i := func() *ContainersCollection {
		c := &ContainersCollection{
			BaseCollection: BaseCollection[pb.Container, *ContainerDoc]{
				collectionName: containersCollection,
				defaultOrderBy: "name",
				defaultLimit:   -1,
			},
		}
		c.setAdapt(c.adapt)
		return c
	}

	registry.Register(containersCollection, i())
}

// ContainersCollection handles operations for the containers collection
type ContainersCollection struct {
	BaseCollection[pb.Container, *ContainerDoc]
}

func (p *ContainersCollection) adapt(pb *pb.Container) (*ContainerDoc, error) {
	if pb.GetId() == "" {
		pb.Id = uuid.New().String()
	}
	return NewContainerDoc(pb)
}

// GetContainersCollection creates a new containers collection handler
func GetContainersCollection() *ContainersCollection {
	c := registry.Get(containersCollection)
	return c.(*ContainersCollection)
}

func (pc *ContainersCollection) QueryByName(ctx context.Context, name string) ([]*ContainerDoc, error) {
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

	var docs []*ContainerDoc
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
