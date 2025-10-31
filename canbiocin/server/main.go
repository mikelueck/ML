package main

import (
	"context"
	"flag"
	"log"
	"net"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/ML/canbiocin/parseXLS"
	pb "github.com/ML/canbiocin/proto"
	"github.com/ML/canbiocin/secrets"

	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"

	"google.golang.org/grpc/health"
	healthpb "google.golang.org/grpc/health/grpc_health_v1"
)

var (
	enforce_auth = flag.String("enforce_auth", true, "should auth be enforced")
)

func InitEnv() {
	secret_list := []string{
		"AUTH0_CLIENT_ID",
		"AUTH0_CLIENT_SECRET",
		"AUTH0_DOMAIN",
		"AUTH0_AUDIENCE"}

	projectid := flag.Lookup("projectid")

	for _, i := range secret_list {
		val, err := secrets.AccessSecretVersion(projectid.Value.String(), i, "")
		if err != nil {
			log.Printf("Error : %v\n", string(val))
		}
		os.Setenv(i, string(val))
	}
}

type CustomClaims struct {
	Scope string `json:"scope"`
}

// Validate does nothing for this example, but we need
// it to satisfy validator.CustomClaims interface.
func (c CustomClaims) Validate(ctx context.Context) error {
	log.Printf("Scopes: %v\n", c.Scope)
	return nil
}

// HasScope checks whether our claims have a specific scope.
func (c CustomClaims) HasScope(expectedScope string) bool {
	result := strings.Split(c.Scope, " ")
	for i := range result {
		if result[i] == expectedScope {
			return true
		}
	}

	return false
}

func verifyToken(ctx context.Context, tokenString string) (*validator.ValidatedClaims, error) {
	issuerURL, err := url.Parse("https://" + os.Getenv("AUTH0_DOMAIN") + "/")
	if err != nil {
		return nil, err
	}

	provider := jwks.NewCachingProvider(issuerURL, 5*time.Minute)

	jwtValidator, err := validator.New(
		provider.KeyFunc,
		validator.RS256,
		issuerURL.String(),
		[]string{os.Getenv("AUTH0_AUDIENCE")},
		validator.WithCustomClaims(
			func() validator.CustomClaims {
				return &CustomClaims{}
			},
		),
		validator.WithAllowedClockSkew(time.Minute),
	)
	if err != nil {
		return nil, err
	}

	claims, err := jwtValidator.ValidateToken(ctx, tokenString)
	if err != nil {
		return nil, err
	}

	return claims.(*validator.ValidatedClaims), nil
}

// AuthInterceptor is a gRPC UnaryServerInterceptor function.
// It checks the incoming context for required metadata and validates the token.
func AuthInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	// 1. Extract metadata from the incoming request context
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "metadata is not provided")
	}

	// 2. Check for the 'authorization' key (gRPC metadata keys are case-insensitive, but typically lower-cased)
	values := md.Get("authorization")
	if len(values) == 0 {
		return nil, status.Error(codes.Unauthenticated, "authorization token is missing")
	}

	authHeader := values[0] // The value should be in the format: "Bearer <token>"

	// 3. Simple token validation logic
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return nil, status.Error(codes.Unauthenticated, "invalid token format (must be 'Bearer <token>')")
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")

	claims, err := verifyToken(ctx, token)

	if err != nil {
		log.Printf("Authentication Failed: Token '%s' is invalid. %v\n", token, err)
		return nil, status.Error(codes.Unauthenticated, "invalid authentication token")
	}

	// 4. Authentication successful, proceed with the RPC call
	ctx = context.WithValue(ctx, "claims", claims)

	// Call the next handler in the chain (which is our SayHello implementation)
	return handler(ctx, req)
}

func main() {
	_ = parseXLS.REFER_TO_LOAD_LIBRARY

	flag.Parse()
	if *grpcport == "" {
		flag.Usage()
		log.Fatalf("missing -grpcport flag (:50051)")
	}

	InitEnv()

	lis, err := net.Listen("tcp", *grpcport)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	ip, err := getOutboundIP()
	log.Printf("Current IP Address: %s, Error: %v\n", ip.String(), err)

	sopts := []grpc.ServerOption{}

	if *enforce_auth {
    sopts = []grpc.ServerOption{
      grpc.UnaryInterceptor(AuthInterceptor),
    }
  }

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
