package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	healthpb "google.golang.org/grpc/health/grpc_health_v1" // The generated protobuf for health service
	"google.golang.org/grpc/status"
)

func main() {
	serverAddr := "localhost:8080" // Address of the gRPC server you want to check
	//serverAddr := "34.107.186.252:80" // Address of the gRPC server you want to check

	// Set up a connection to the gRPC server.
	conn, err := grpc.Dial(serverAddr, grpc.WithInsecure(), grpc.WithBlock())
	if err != nil {
		log.Fatalf("Did not connect to %s: %v", serverAddr, err)
	}
	defer conn.Close()

	// Create a client stub for the gRPC Health service.
	healthClient := healthpb.NewHealthClient(conn)

	fmt.Println("--- Performing gRPC Health Checks (Check RPC) ---")

	// Scenario 1: Check Overall Server Health
	// An empty string "" for the service name requests the overall server health.
	checkOverallHealth(healthClient)

	// Scenario 2: Check a specific service (e.g., "test.TestService" from our test server)
	checkServiceHealth(healthClient, "CanbiocinService")

	// Scenario 4: Check a non-existent service
	checkServiceHealth(healthClient, "non.existent.Service")

	// Keep the main goroutine alive to allow the watch goroutine to receive updates.
	// In a real application, this might be handled by application lifecycle management.
	fmt.Printf("Client will run for 30 seconds to observe Watch updates for '%s'...\n", "test.TestService")
	time.Sleep(30 * time.Second)
	fmt.Println("\nClient finished.")
}

// checkOverallHealth performs a unary Check RPC for the overall server health.
func checkOverallHealth(client healthpb.HealthClient) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	req := &healthpb.HealthCheckRequest{Service: ""} // Empty service name for overall health
	resp, err := client.Check(ctx, req)
	if err != nil {
		handleHealthError(fmt.Sprintf("Overall server health check failed"), err)
		return
	}
	fmt.Printf("Overall Server Health: %s\n", resp.Status.String())
}

// checkServiceHealth performs a unary Check RPC for a specific service.
func checkServiceHealth(client healthpb.HealthClient, serviceName string) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	req := &healthpb.HealthCheckRequest{Service: serviceName}
	resp, err := client.Check(ctx, req)
	if err != nil {
		handleHealthError(fmt.Sprintf("Health check for service '%s' failed", serviceName), err)
		return
	}
	fmt.Printf("Service '%s' Health: %s\n", serviceName, resp.Status.String())
}

// watchServiceHealth starts a server-streaming Watch RPC for a specific service
// and prints updates as they arrive.
func watchServiceHealth(client healthpb.HealthClient, serviceName string) {
	ctx, cancel := context.WithCancel(context.Background())
	// Ensure the context is cancelled when the main function exits or watch is done.
	// In a real app, you might have more granular control over this cancel.
	defer cancel()

	req := &healthpb.HealthCheckRequest{Service: serviceName}
	stream, err := client.Watch(ctx, req)
	if err != nil {
		handleHealthError(fmt.Sprintf("Failed to start Watch RPC for service '%s'", serviceName), err)
		return
	}

	fmt.Printf("Watching service '%s' for health changes...\n", serviceName)

	go func() {
		for {
			resp, err := stream.Recv()
			if err == io.EOF {
				fmt.Printf("Watch stream for service '%s' closed by server.\n", serviceName)
				return
			}
			if err != nil {
				// Check for context cancellation, which is a normal way for client to stop watch
				if status.Code(err) == codes.Canceled {
					fmt.Printf("Watch stream for service '%s' cancelled by client.\n", serviceName)
				} else {
					log.Printf("Error receiving watch update for service '%s': %v", serviceName, err)
				}
				return
			}
			fmt.Printf("Watch Update for '%s': Status changed to %s\n", serviceName, resp.Status.String())
		}
	}()
}

// handleHealthError provides a consistent way to log gRPC errors from health checks.
func handleHealthError(message string, err error) {
	if s, ok := status.FromError(err); ok {
		if s.Code() == codes.NotFound {
			fmt.Printf("%s: Service not found (%s)\n", message, s.Message())
		} else if s.Code() == codes.DeadlineExceeded {
			fmt.Printf("%s: Deadline exceeded (%s)\n", message, s.Message())
		} else {
			log.Printf("%s: gRPC error code %s, details: %s\n", message, s.Code(), s.Message())
		}
	} else {
		log.Printf("%s: Non-gRPC error: %v\n", message, err)
	}
}
