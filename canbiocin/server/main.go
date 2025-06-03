package main

import (
	"context"
	"flag"
	"log"
	"net"

	"github.com/ML/canbiocin/parseXLS"
	pb "github.com/ML/canbiocin/proto"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/health"
	healthpb "google.golang.org/grpc/health/grpc_health_v1"
	"google.golang.org/grpc/status"
)

var (
	hs *health.Server
)

type healthServer struct{}

func (s *healthServer) Check(ctx context.Context, in *healthpb.HealthCheckRequest) (*healthpb.HealthCheckResponse, error) {
	log.Printf("Handling grpc Check request: " + in.Service)
	return &healthpb.HealthCheckResponse{Status: healthpb.HealthCheckResponse_SERVING}, nil
}

func (s *healthServer) List(ctx context.Context, in *healthpb.HealthListRequest) (*healthpb.HealthListResponse, error) {
	return nil, status.Error(codes.Unimplemented, "List is not implemented")
}

func (s *healthServer) Watch(in *healthpb.HealthCheckRequest, srv healthpb.Health_WatchServer) error {
	return status.Error(codes.Unimplemented, "Watch is not implemented")
}

func main() {
	_ = parseXLS.REFER_TO_LOAD_LIBRARY

	flag.Parse()
	if *grpcport == "" {
		flag.Usage()
		log.Fatalf("missing -grpcport flag (:50051)")
	}

	lis, err := net.Listen("tcp", *grpcport)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	sopts := []grpc.ServerOption{}

	s := grpc.NewServer(sopts...)
	pb.RegisterCanbiocinServiceServer(s, &server{})

	healthpb.RegisterHealthServer(s, &healthServer{})

	log.Printf("Starting server...")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
