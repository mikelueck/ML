package db

import (
	"context"
	"fmt"
	"reflect"

	"cloud.google.com/go/firestore"
)

type FireStoreClient struct {
	client *firestore.Client
}

func (c *FireStoreClient) Create(ctx context.Context, folder string, doc Document) (string, error) {
	_, err := c.client.Collection(folder).Doc(doc.GetID()).Create(ctx, doc)
  if err != nil {
    return "", err
  }
	return doc.GetID(), nil
}

func (c *FireStoreClient) Get(ctx context.Context, folder string, id string, doc Document) error {
	docRef := c.client.Collection(folder).Doc(id)
	snapshot, err := docRef.Get(ctx)
	if err != nil {
		return err
	}
	return c.NewDocument(snapshot, doc)
}

func (c *FireStoreClient) Update(ctx context.Context, folder string, doc Document) error {
	_, err := c.client.Collection(folder).Doc(doc.GetID()).Set(ctx, doc)
	return err
}

func (c *FireStoreClient) Delete(ctx context.Context, folder string, id string) error {
	doc := c.client.Collection(folder).Doc(id)
	_, err := doc.Delete(ctx)
	return err
}

func (c *FireStoreClient) List(ctx context.Context, folder string) (DocIterator, error) {
	iter := c.client.Collection(folder).Documents(ctx)
	return &FireStoreIterator{client: c, iter: iter}, nil
}

func (c *FireStoreClient) Query(ctx context.Context, folder string, query []*QueryCriteria) (DocIterator, error) {
	var stmt firestore.Query
	if len(query) > 0 {
		q := query[0]
		stmt = c.client.Collection(folder).Where(q.Name, q.Op, q.Value)
	}
	if len(query) > 1 {
		for _, q := range query[1:] {
			stmt = stmt.Where(q.Name, q.Op, q.Value)
		}
	}
	iter := stmt.Documents(ctx)

	return &FireStoreIterator{client: c, iter: iter}, nil
}

func (c *FireStoreClient) Close() error {
	return c.client.Close()
}

type FireStoreIterator struct {
	client *FireStoreClient
	iter   *firestore.DocumentIterator
}

func (i *FireStoreIterator) Next(doc Document) error {
	snapshot, err := i.iter.Next()
	if err != nil {
		return err
	}

	return i.client.NewDocument(snapshot, doc)
}

func (i *FireStoreIterator) Stop() {
	i.iter.Stop()
}

func (c *FireStoreClient) NewDocument(i interface{}, doc Document) error {
	switch reflect.TypeOf(i).String() {
	case "firestore.DocumentSnapshot":
		value := i.(*firestore.DocumentSnapshot)

		if err := value.DataTo(doc); err != nil {
			return err
		}
		return nil
	default:
		fmt.Println(reflect.TypeOf(i).String())
	}
	return nil
}
