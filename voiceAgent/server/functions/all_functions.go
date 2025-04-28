package functions

import (
	"fmt"

	structpb "google.golang.org/protobuf/types/known/structpb"
)

type (
	Function struct {
		id       string
		function func(*structpb.Struct) (*structpb.Struct, error)
	}
)

var AllFunctions map[string]*Function

func RegisterFunc(id string, f *Function) {
	if AllFunctions == nil {
		AllFunctions = make(map[string]*Function)
	}
	AllFunctions[id] = f
}

func CallFunc(id string, params *structpb.Struct) (*structpb.Struct, error) {
	f, ok := AllFunctions[id]

	if ok {
		return f.function(params)
	} else {
		return nil, fmt.Errorf("Couldn't find tool %s", id)
	}
}
