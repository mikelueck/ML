package db

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/option"
)

const projectid = "1234"

var client *DbClient

var _ ClientInterface = (*DbClient)(nil)

const useMock = true

type DocIterator interface {
	Next(Document) error
	Stop()
}

type QueryCriteria struct {
	Name  string
	Op    string
	Value interface{}
}

type Document interface {
	GetID() string
}

type ClientInterface interface {
	Create(context.Context, string, Document) error
	Get(context.Context, string, string, Document) error
	Update(context.Context, string, Document) error
	Delete(context.Context, string, string) error
	List(context.Context, string) (DocIterator, error)
	Query(context.Context, string, []*QueryCriteria) (DocIterator, error)
	Close() error
	NewDocument(interface{}, Document) error
}

type DbClient struct {
	client ClientInterface
}

func (c *DbClient) Create(ctx context.Context, folder string, doc Document) error {
	return c.client.Create(ctx, folder, doc)
}

func (c *DbClient) Get(ctx context.Context, folder string, id string, doc Document) error {
	return c.client.Get(ctx, folder, id, doc)
}

func (c *DbClient) Update(ctx context.Context, folder string, doc Document) error {
	return c.client.Update(ctx, folder, doc)
}

func (c *DbClient) Delete(ctx context.Context, folder string, id string) error {
	return c.client.Delete(ctx, folder, id)
}

func (c *DbClient) List(ctx context.Context, folder string) (DocIterator, error) {
	return c.client.List(ctx, folder)
}

func (c *DbClient) Query(ctx context.Context, folder string, query []*QueryCriteria) (DocIterator, error) {
	return c.client.Query(ctx, folder, query)
}

func (c *DbClient) Close() error {
	return c.client.Close()
}

func (c *DbClient) NewDocument(i interface{}, doc Document) error {
	return c.client.NewDocument(i, doc)
}

func init() {
	if !useMock {
		var err error
		client, err = newClient(context.Background(), projectid, "")
		if err != nil {
			fmt.Printf("Error creating firestore client: %v\n", err)
		}
	} else {
		client = &DbClient{client: NewMockClient()}
	}
}

// NewClient creates a new Firestore client
func newClient(ctx context.Context, projectID string, credentialsFile string) (*DbClient, error) {

	opt := option.WithCredentialsFile(credentialsFile)
	client, err := firestore.NewClient(ctx, projectID, opt)
	if err != nil {
		return nil, err
	}

	return &DbClient{client: &FireStoreClient{client: client}}, nil
}
