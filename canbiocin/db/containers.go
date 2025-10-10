package db

import (
	pb "github.com/ML/canbiocin/proto"
	"github.com/google/uuid"
)

const containersCollection = "containers"

func init() {
	i := func() *ContainersCollection {
		c := &ContainersCollection{
			BaseCollection: BaseCollection[pb.Container, *ContainerDoc]{
				collectionName: containersCollection,
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
