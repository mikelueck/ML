package main

import (
	"context"
	"flag"

	pb "github.com/ML/chat/proto"
)

var (
	grpcport = flag.String("grpcport", ":8082", "grpcport")
)

// implementation of ChatService
type server struct{}

func (s *server) GetRoomsByUser(ctx context.Context, req *pb.GetRoomsByUserRequest) (*pb.GetRoomsByUserResponse, error) {
	return &pb.GetRoomsByUserResponse{}, nil
}
