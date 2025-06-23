package main

import (
	"flag"
	"log"
	"net"

	"github.com/ML/canbiocin/parseXLS"
	pb "github.com/ML/canbiocin/proto"

	"google.golang.org/grpc"

  "google.golang.org/grpc/health" 
	healthpb "google.golang.org/grpc/health/grpc_health_v1"
)

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

  ip, err := getOutboundIP()
  log.Printf("Current IP Address: %s, Error: %v\n", ip.String(), err)

	sopts := []grpc.ServerOption{}

	s := grpc.NewServer(sopts...)
	pb.RegisterCanbiocinServiceServer(s, &server{})

  healthServer := health.NewServer()
	healthpb.RegisterHealthServer(s, healthServer)

  healthServer.SetServingStatus("", healthpb.HealthCheckResponse_SERVING)
	healthServer.SetServingStatus("CanbiocinService", healthpb.HealthCheckResponse_SERVING)

	log.Printf("Starting server...")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}

// getOutboundIP gets the preferred outbound IP address of this machine.
// It works by attempting to establish a UDP connection to a public DNS server
// (without actually sending data) and then retrieving the local address of that connection.
func getOutboundIP() (net.IP, error) {
	conn, err := net.Dial("udp", "8.8.8.8:80") // Google's public DNS server
	if err != nil {
		return nil, err
	}
	defer conn.Close()

	localAddr := conn.LocalAddr().(*net.UDPAddr)
	return localAddr.IP, nil
}
