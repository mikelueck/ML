package secrets

import (
	"context"
	"fmt"

	secretmanager "cloud.google.com/go/secretmanager/apiv1"
	"cloud.google.com/go/secretmanager/apiv1/secretmanagerpb"

	"github.com/ML/canbiocin/utils"
	"google.golang.org/api/option"
)

// accessSecretVersion accesses the payload of the specified secret version.
func AccessSecretVersion(projectID, secretID, versionID string) ([]byte, error) {
	// Create the Secret Manager client.
	ctx := context.Background()

	opt := option.WithCredentialsFile(utils.GetCredentialsFile())

	client, err := secretmanager.NewClient(ctx, opt)
	if err != nil {
		return nil, fmt.Errorf("failed to create secretmanager client: %w", err)
	}
	defer client.Close()

	if versionID == "" {
		versionID = "latest"
	}

	// Build the request to access the latest secret version.
	name := fmt.Sprintf("projects/%s/secrets/%s/versions/%s", projectID, secretID, versionID)
	req := &secretmanagerpb.AccessSecretVersionRequest{
		Name: name,
	}

	// Call the API.
	result, err := client.AccessSecretVersion(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to access secret version: %w", err)
	}

	return result.Payload.Data, nil
}
