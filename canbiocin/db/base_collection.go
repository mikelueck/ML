package db

import (
	"context"
	"fmt"
	"reflect"
	"sync"

	"google.golang.org/api/iterator"
)

type CollectionInterface[ProtoType any, DocType Document] interface {
	Create(context.Context, *ProtoType) error
	Update(context.Context, *ProtoType) error
	Delete(context.Context, string) error
	Get(context.Context, string) (DocType, error)
	List(context.Context) ([]DocType, error)
	getWrapper() DocType
	adapt(*ProtoType) (DocType, error)
}

type BaseCollection[ProtoType any, DocType Document] struct {
	collectionName string

	// This is really hacky...I want to call my parent classes adapt method
	// so I have to set this during construction of the parent class
	adaptFunc func(*ProtoType) (DocType, error)
}

func (b *BaseCollection[ProtoType, DocType]) setAdapt(f func(*ProtoType) (DocType, error)) {
	b.adaptFunc = f
}

func (b *BaseCollection[ProtoType, DocType]) adapt(p *ProtoType) (DocType, error) {
	return b.adaptFunc(p)
}

func (b *BaseCollection[ProtoType, DocType]) getWrapper() DocType {
	var wrapper DocType
	t := reflect.TypeOf(wrapper).Elem()

	v := reflect.New(t)
	return v.Interface().(DocType)
}

// Create adds a new postbiotic to the collection
func (b *BaseCollection[ProtoType, DocType]) Create(ctx context.Context, p *ProtoType) error {
	doc, err := b.adapt(p)
	if err != nil {
		return err
	}
	return client.Create(ctx, b.collectionName, doc)
}

// Get retrieves a postbiotic by ID
func (b *BaseCollection[ProtoType, DocType]) Get(ctx context.Context, id string) (DocType, error) {
	docWrapper := b.getWrapper()
	err := client.Get(ctx, b.collectionName, id, docWrapper)
	if err != nil {
		return docWrapper, err
	}
	return docWrapper, nil
}

// Update updates an existing postbiotic
func (b *BaseCollection[ProtoType, DocType]) Update(ctx context.Context, p *ProtoType) error {
	doc, err := b.adapt(p)
	if err != nil {
		return err
	}
	return client.Update(ctx, b.collectionName, doc)
}

// Delete removes a postbiotic from the collection
func (b *BaseCollection[ProtoType, DocType]) Delete(ctx context.Context, id string) error {
	return client.Delete(ctx, b.collectionName, id)
}

// List retrieves all postbiotics
func (b *BaseCollection[ProtoType, DocType]) List(ctx context.Context) ([]DocType, error) {
	iter, err := client.List(ctx, b.collectionName)
	if err != nil {
		return nil, err
	}
	defer iter.Stop()

	var docs []DocType
	for {
		docWrapper := b.getWrapper()
		err := iter.Next(docWrapper)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		docs = append(docs, docWrapper)
	}
	return docs, nil
}

type Registry struct {
	lock                  sync.RWMutex
	registeredCollections map[string]interface{}
}

var registry *Registry = &Registry{registeredCollections: make(map[string]interface{})}

func (r *Registry) Get(name string) interface{} {
	r.lock.RLock()
	defer r.lock.RUnlock()

	collection, ok := r.registeredCollections[name]
	if ok {
		return collection
	} else {
		return nil
	}
}

func (r *Registry) Register(name string, collection interface{}) {
	r.lock.Lock()
	defer r.lock.Unlock()

	fmt.Printf("Registering: %s\n", name)

	r.registeredCollections[name] = collection
}
