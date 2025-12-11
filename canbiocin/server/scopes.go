package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"strings"

	pb "github.com/ML/canbiocin/proto"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

var (
	enforce_auth = flag.Bool("enforce_auth", false, "should auth be enforced")
)

const READ_RECIPE = "read:recipes"
const WRITE_RECIPE = "write:recipes"
const SAVE_RECIPE = "save:recipes"
const DEL_RECIPE = "delete:recipes"
const READ_INGREDIENT = "read:ingredients"
const WRITE_INGREDIENT = "write:ingredients"
const DEL_INGREDIENT = "delete:ingredients"
const READ_OTHER = "read:other"
const WRITE_OTHER = "write:other"
const DEL_OTHER = "delete:other"

var funcAuth = map[string]string{
	"CreateIngredient":      WRITE_INGREDIENT,
	"GetIngredient":         READ_INGREDIENT,
	"UpdateIngredient":      WRITE_INGREDIENT,
	"DeleteIngredient":      DEL_INGREDIENT,
	"ListIngredients":       READ_INGREDIENT,
	"ListProbioticSpp":      READ_INGREDIENT,
	"ListPrebioticCategory": READ_INGREDIENT,
	"CreateRecipe":          WRITE_RECIPE,
	"GetRecipe":             READ_RECIPE,
	"UpdateRecipe":          WRITE_RECIPE,
	"DeleteRecipe":          DEL_RECIPE,
	"ListRecipes":           READ_RECIPE,
	"CalculateRecipe":       READ_RECIPE,
	"CreateContainer":       WRITE_OTHER,
	"DeleteContainer":       DEL_OTHER,
	"UpdateContainer":       WRITE_OTHER,
	"ListContainers":        READ_OTHER,
	"CreateSavedRecipe":     SAVE_RECIPE,
	"GetSavedRecipe":        READ_RECIPE,
	"UpdateSavedRecipe":     SAVE_RECIPE,
	"DeleteSavedRecipe":     SAVE_RECIPE,
	"ListSavedRecipes":      READ_RECIPE,
	"CreatePackaging":       WRITE_OTHER,
	"DeletePackaging":       DEL_OTHER,
	"UpdatePackaging":       WRITE_OTHER,
	"ListPackaging":         READ_OTHER,
	"ListShipping":          READ_OTHER,
	"ListAllPackaging":      READ_OTHER,
	"CreatePackagingItem":   WRITE_OTHER,
	"GetPackagingItem":      READ_OTHER,
	"UpdatePackagingItem":   WRITE_OTHER,
	"DeletePackagingItem":   DEL_OTHER,
}

func init() {
	fd := pb.File_canbiocin_proto_service_proto

	for i := 0; i < fd.Services().Len(); i++ {
		serviceDesc := fd.Services().Get(i)

		for j := 0; j < serviceDesc.Methods().Len(); j++ {
			m := serviceDesc.Methods().Get(j).Name()
			_, ok := funcAuth[string(m)]
			if !ok {
				log.Fatalf("need to specify authorization for method '%v'", m)
			}
		}
	}
}

const CLAIMS_CTX = "claims"

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

func checkClaimsForMethod(ctx context.Context, method string) error {
	allowed := false

	ctxVal := ctx.Value(CLAIMS_CTX)
	var claims *validator.ValidatedClaims

	if ctxVal != nil {
		claims = ctxVal.(*validator.ValidatedClaims)
	}

	if claims != nil {
		customClaims := claims.CustomClaims.(*CustomClaims)

		req, ok := funcAuth[method]

		if ok && customClaims.HasScope(req) {
			allowed = true
		}
	}

	if !allowed {
		msg := fmt.Sprintf("Missing authorization for '%v'", method)
		if *enforce_auth {
			log.Printf("Enforced Auth: True, %s", msg)
			return status.Error(codes.Unauthenticated, msg)
		} else {
			log.Printf("Enforced Auth: False, %s", msg)
		}
	}
	return nil
}
