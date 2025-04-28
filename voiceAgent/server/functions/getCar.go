package functions

import (
	"strings"

	structpb "google.golang.org/protobuf/types/known/structpb"
)

type (
	Car struct {
		year             int32
		make             string
		model            string
		transmission     string
		num_of_doors     int32
		fourWheel        string
		colors           []string
		safety_rating    int
		fuel_eff_city    float32
		fuel_eff_highway float32
	}
)

var carsByColor = make(map[string][]*Car, 0)

func init() {
	var carData = []*Car{
		&Car{year: 2025,
			make:             "Toyota",
			model:            "Camry",
			transmission:     "Automatic",
			num_of_doors:     4,
			fourWheel:        "No",
			safety_rating:    5,
			colors:           []string{"White", "Black", "Red"},
			fuel_eff_city:    7.8,
			fuel_eff_highway: 5.6},

		&Car{year: 2025,
			make:             "Honda",
			model:            "Civic",
			transmission:     "CVT",
			num_of_doors:     4,
			fourWheel:        "No",
			safety_rating:    5,
			colors:           []string{"Blue", "Gray", "White"},
			fuel_eff_city:    7.1,
			fuel_eff_highway: 5.9},

		&Car{year: 2025,
			make:             "Ford",
			model:            "F-150",
			transmission:     "Automatic",
			num_of_doors:     4,
			fourWheel:        "Yes",
			safety_rating:    4,
			colors:           []string{"Black", "Silver", "Blue"},
			fuel_eff_city:    11.8,
			fuel_eff_highway: 9.4},

		&Car{year: 2025,
			make:             "Chevrolet",
			model:            "Silverado",
			transmission:     "Automatic",
			num_of_doors:     4,
			fourWheel:        "Yes",
			safety_rating:    4,
			colors:           []string{"Red", "White", "Black"},
			fuel_eff_city:    13.1,
			fuel_eff_highway: 10.7},

		&Car{year: 2025,
			make:             "Nissan",
			model:            "Rogue",
			transmission:     "CVT",
			num_of_doors:     4,
			fourWheel:        "Optional",
			safety_rating:    5,
			colors:           []string{"Gray", "Black", "White"},
			fuel_eff_city:    8.4,
			fuel_eff_highway: 6.7},

		&Car{year: 2025,
			make:             "Jeep",
			model:            "Wrangler",
			transmission:     "Automatic",
			num_of_doors:     4,
			fourWheel:        "Yes",
			safety_rating:    4,
			colors:           []string{"Green", "Black", "White"},
			fuel_eff_city:    13.8,
			fuel_eff_highway: 11.2},

		&Car{year: 2025,
			make:             "Tesla",
			model:            "Model 3",
			transmission:     "Automatic",
			num_of_doors:     4,
			fourWheel:        "Optional",
			safety_rating:    5,
			colors:           []string{"White", "Black", "Blue"},
			fuel_eff_city:    2.0,
			fuel_eff_highway: 1.8},

		&Car{year: 2025,
			make:             "Hyundai",
			model:            "Tucson",
			transmission:     "Automatic",
			num_of_doors:     4,
			fourWheel:        "Optional",
			safety_rating:    5,
			colors:           []string{"Gray", "White", "Blue"},
			fuel_eff_city:    9.0,
			fuel_eff_highway: 7.2},

		&Car{year: 2025,
			make:             "Kia",
			model:            "Sportage",
			transmission:     "Automatic",
			num_of_doors:     4,
			fourWheel:        "Optional",
			safety_rating:    5,
			colors:           []string{"Black", "White", "Red"},
			fuel_eff_city:    8.7,
			fuel_eff_highway: 6.9},

		&Car{year: 2025,
			make:             "Subaru",
			model:            "Outback",
			transmission:     "CVT",
			num_of_doors:     4,
			fourWheel:        "Yes",
			safety_rating:    5,
			colors:           []string{"Green", "White", "Black"},
			fuel_eff_city:    9.4,
			fuel_eff_highway: 7.8}}

	for _, car := range carData {
		for _, c := range car.colors {
			color := strings.ToLower(c)
			cars, ok := carsByColor[color]
			if !ok {
				cars = make([]*Car, 0)
				carsByColor[color] = cars
			}
			carsByColor[color] = append(cars, car)
		}
	}
}

func init() {
	const toolId = "projects/voice-agent-454313/locations/us-central1/agents/c7651fa1-56ba-4fd6-ba1c-9ff233d5fc3f/tools/364c92c8-3bc4-41dc-8e86-d5facc1fe81a"

	RegisterFunc(toolId, &Function{id: toolId, function: GetCar})
}

func ToCarOut(car *Car) (*structpb.Value, error) {
	fields := map[string]any{
		"make":  car.make,
		"model": car.model}
	s, err := structpb.NewStruct(fields)
	if err != nil {
		return nil, err
	}
	return structpb.NewStructValue(s), nil
}

func GetCar(params *structpb.Struct) (*structpb.Struct, error) {
	cars := []*structpb.Value{}

	colorValue := params.GetFields()["color"]
	if colorValue != nil {
		color := strings.ToLower(colorValue.GetStringValue())
		if match, ok := carsByColor[color]; ok {
			for _, m := range match {
				newCar, err := ToCarOut(m)
				if err != nil {
					return nil, err
				}
				cars = append(cars, newCar)
			}
		}
	}

	retval := &structpb.Struct{Fields: make(map[string]*structpb.Value)}
	list := &structpb.ListValue{Values: cars}

	retval.Fields["cars"] = structpb.NewListValue(list)

	return retval, nil
}
