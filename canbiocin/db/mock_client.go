package db

import (
	"context"
	"fmt"
	"iter"
	"reflect"
	"slices"
	"sort"

	"google.golang.org/api/iterator"
)

type Collection struct {
	docs map[string]Document
}

func (c *Collection) Add(doc Document) {
	c.docs[doc.GetID()] = doc
}

func (c *Collection) Get(id string) (Document, error) {
	doc, ok := c.docs[id]
	if !ok {
		return nil, fmt.Errorf("Not Found")
	}
	return doc, nil
}

func (c *Collection) Delete(id string) error {
	_, ok := c.docs[id]
	if !ok {
		return fmt.Errorf("Not Found")
	}
	delete(c.docs, id)
	return nil
}

func newCollection() *Collection {
	return &Collection{docs: make(map[string]Document)}
}

type MockClient struct {
	collections map[string]*Collection
}

func NewMockClient() *MockClient {
	return &MockClient{collections: make(map[string]*Collection)}
}

func (c *MockClient) Create(ctx context.Context, folder string, doc Document) (string, error) {
	docs, ok := c.collections[folder]
	if !ok {
		docs = newCollection()
		c.collections[folder] = docs
	}
	docs.Add(doc)
	return doc.GetID(), nil
}

func copy(from Document, to Document) {

	t := reflect.ValueOf(to).Elem()
	f := reflect.ValueOf(from).Elem()

	for i := 0; i < f.NumField(); i++ {
		t.Field(i).Set(f.Field(i))
	}
}

func (c *MockClient) Get(ctx context.Context, folder string, id string, doc Document) error {
	docs, ok := c.collections[folder]
	if !ok {
		return fmt.Errorf("Not Found")
	}
	d, err := docs.Get(id)
	if err != nil {
		return err
	}
	copy(d, doc)
	doc = d
	return nil
}

func (c *MockClient) Update(ctx context.Context, folder string, doc Document) error {
	docs, ok := c.collections[folder]
	if !ok {
		return fmt.Errorf("Not Found")
	}

	_, err := docs.Get(doc.GetID())
	if !ok {
		return err
	}

	docs.Add(doc)
	return err
}

func (c *MockClient) Delete(ctx context.Context, folder string, id string) error {
	docs, ok := c.collections[folder]
	if !ok {
		return fmt.Errorf("Not Found")
	}

	_, err := docs.Get(id)
	if !ok {
		return err
	}

	docs.Delete(id)
	return nil
}

func (c *MockClient) List(ctx context.Context, folder string, orderBy string, limit int) (DocIterator, error) {
	docs, ok := c.collections[folder]
	if !ok {
		return nil, fmt.Errorf("Not Found")
	}
	arr := make([]Document, 0, len(docs.docs))
	for key := range docs.docs {
		arr = append(arr, docs.docs[key])
	}
	sort.Slice(arr, func(i, j int) bool {
		return arr[i].GetName() < arr[j].GetName()
	})

	return NewMockIterator(arr), nil
}

func (c *MockClient) Query(ctx context.Context, folder string, query []*QueryCriteria, orderBy string, limit int) (DocIterator, error) {
	// TODO now we just call List
	return c.List(ctx, folder, orderBy, limit)
}

func (c *MockClient) Close() error {
	return nil
}

type MockIterator struct {
	next func() (Document, bool)
	stop func()
}

func NewMockIterator(docs []Document) *MockIterator {
	next, stop := iter.Pull(slices.Values(docs))
	return &MockIterator{next: next, stop: stop}
}

func (i *MockIterator) Next(doc Document) error {
	d, ok := i.next()
	if !ok {
		return iterator.Done
	}

	copy(d, doc)

	return nil
}

func (i *MockIterator) Stop() {
	i.stop()
}

func (c *MockClient) NewDocument(i interface{}, doc Document) error {
	switch reflect.TypeOf(i).String() {
	case "firestore.DocumentSnapshot":
		fmt.Println(reflect.TypeOf(i).String())
		return nil
	default:
		fmt.Println(reflect.TypeOf(i).String())
	}
	return nil
}
