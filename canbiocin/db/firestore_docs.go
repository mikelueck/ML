package db

import (
	pb "github.com/ML/canbiocin/proto"
	"google.golang.org/protobuf/proto"
)

// FirestoreDoc is the interface that all Firestore document wrappers must implement
type FirestoreDoc interface {
	GetID() string
	GetProtoBytes() []byte
	GetProto() proto.Message
	GetName() string
}

// PostbioticDoc wraps a postbiotic document for Firestore storage
type PostbioticDoc struct {
	ID         string `firestore:"id"`
	Name       string `firestore:"name"`
	ProtoBytes []byte `firestore:"proto_bytes"`
}

// GetID returns the document ID
func (d *PostbioticDoc) GetID() string {
	return d.ID
}

// GetProtoBytes returns the raw proto bytes
func (d *PostbioticDoc) GetProtoBytes() []byte {
	return d.ProtoBytes
}

// GetProto unmarshals and returns the proto message
func (d *PostbioticDoc) GetProto() proto.Message {
	msg := &pb.Postbiotic{}
	if err := proto.Unmarshal(d.ProtoBytes, msg); err != nil {
		return nil
	}
	return msg
}

// GetName returns the document name
func (d *PostbioticDoc) GetName() string {
	return d.Name
}

// NewPostbioticDoc creates a new PostbioticDoc from a proto message
func NewPostbioticDoc(msg *pb.Postbiotic) (*PostbioticDoc, error) {
	bytes, err := proto.Marshal(msg)
	if err != nil {
		return nil, err
	}
	return &PostbioticDoc{
		ID:         msg.GetId(),
		Name:       msg.GetName(),
		ProtoBytes: bytes,
	}, nil
}

// PrebioticDoc wraps a prebiotic document for Firestore storage
type PrebioticDoc struct {
	ID         string `firestore:"id"`
	Category   string `firestore:"category"`
	Name       string `firestore:"name"`
	ProtoBytes []byte `firestore:"proto_bytes"`
}

// GetID returns the document ID
func (d *PrebioticDoc) GetID() string {
	return d.ID
}

// GetCategory returns the category
func (d *PrebioticDoc) GetCategory() string {
	return d.Category
}

// GetProtoBytes returns the raw proto bytes
func (d *PrebioticDoc) GetProtoBytes() []byte {
	return d.ProtoBytes
}

// GetProto unmarshals and returns the proto message
func (d *PrebioticDoc) GetProto() proto.Message {
	msg := &pb.Prebiotic{}
	if err := proto.Unmarshal(d.ProtoBytes, msg); err != nil {
		return nil
	}
	return msg
}

// GetName returns the document name
func (d *PrebioticDoc) GetName() string {
	return d.Name
}

// NewPrebioticDoc creates a new PrebioticDoc from a proto message
func NewPrebioticDoc(msg *pb.Prebiotic) (*PrebioticDoc, error) {
	bytes, err := proto.Marshal(msg)
	if err != nil {
		return nil, err
	}
	return &PrebioticDoc{
		ID:         msg.GetId(),
		Category:   msg.GetCategory(),
		Name:       msg.GetName(),
		ProtoBytes: bytes,
	}, nil
}

// ProbioticDoc wraps a probiotic document for Firestore storage
type ProbioticDoc struct {
	ID         string `firestore:"id"`
	Spp        string `firestore:"spp"`
	Name       string `firestore:"name"`
	ProtoBytes []byte `firestore:"proto_bytes"`
}

// GetID returns the document ID
func (d *ProbioticDoc) GetID() string {
	return d.ID
}

// GetProtoBytes returns the raw proto bytes
func (d *ProbioticDoc) GetProtoBytes() []byte {
	return d.ProtoBytes
}

// GetProto unmarshals and returns the proto message
func (d *ProbioticDoc) GetProto() proto.Message {
	msg := &pb.Probiotic{}
	if err := proto.Unmarshal(d.ProtoBytes, msg); err != nil {
		return nil
	}
	return msg
}

// GetName returns the document name
func (d *ProbioticDoc) GetName() string {
	return d.Name
}

// GetName returns the document name
func (d *ProbioticDoc) GetSpp() string {
	return d.Spp
}

// NewProbioticDoc creates a new ProbioticDoc from a proto message
func NewProbioticDoc(msg *pb.Probiotic) (*ProbioticDoc, error) {
	bytes, err := proto.Marshal(msg)
	if err != nil {
		return nil, err
	}
	return &ProbioticDoc{
		ID:         msg.GetId(),
		Spp:        msg.GetSpp(),
		Name:       msg.GetStrain(),
		ProtoBytes: bytes,
	}, nil
}

// RecipeDoc wraps a recipe document for Firestore storage
type RecipeDoc struct {
	ID         string `firestore:"id"`
	Name       string `firestore:"name"`
	Company    string `firestore:"company"`
	ProtoBytes []byte `firestore:"proto_bytes"`
}

// GetID returns the document ID
func (d *RecipeDoc) GetID() string {
	return d.ID
}

// GetProtoBytes returns the raw proto bytes
func (d *RecipeDoc) GetProtoBytes() []byte {
	return d.ProtoBytes
}

// GetProto unmarshals and returns the proto message
func (d *RecipeDoc) GetProto() proto.Message {
	msg := &pb.Recipe{}
	if err := proto.Unmarshal(d.ProtoBytes, msg); err != nil {
		return nil
	}
	return msg
}

// GetName returns the recipe name
func (d *RecipeDoc) GetName() string {
	return d.Name
}

// GetCompany returns the company name
func (d *RecipeDoc) GetCompany() string {
	return d.Company
}

// NewRecipeDoc creates a new RecipeDoc from a proto message
func NewRecipeDoc(msg *pb.Recipe) (*RecipeDoc, error) {
	bytes, err := proto.Marshal(msg)
	if err != nil {
		return nil, err
	}
	// Use ID as name since Recipe has no name field
	return &RecipeDoc{
		ID:         msg.GetId(),
		Name:       msg.GetName(),
		Company:    msg.GetCompany().GetName(),
		ProtoBytes: bytes,
	}, nil
}

// PackagingAndMillingDoc wraps a packaging and milling document for Firestore storage
type PackagingAndMillingDoc struct {
	ID         string `firestore:"id"`
	Name       string `firestore:"name"` // Derived from ID
	ProtoBytes []byte `firestore:"proto_bytes"`
}

// GetID returns the document ID
func (d *PackagingAndMillingDoc) GetID() string {
	return d.ID
}

// GetProtoBytes returns the raw proto bytes
func (d *PackagingAndMillingDoc) GetProtoBytes() []byte {
	return d.ProtoBytes
}

// GetProto unmarshals and returns the proto message
func (d *PackagingAndMillingDoc) GetProto() proto.Message {
	msg := &pb.PackagingAndMilling{}
	if err := proto.Unmarshal(d.ProtoBytes, msg); err != nil {
		return nil
	}
	return msg
}

// GetName returns the document name
func (d *PackagingAndMillingDoc) GetName() string {
	return d.Name
}

// NewPackagingAndMillingDoc creates a new PackagingAndMillingDoc from a proto message
func NewPackagingAndMillingDoc(msg *pb.PackagingAndMilling) (*PackagingAndMillingDoc, error) {
	bytes, err := proto.Marshal(msg)
	if err != nil {
		return nil, err
	}
	// Use ID as name since PackagingAndMilling has no name field
	return &PackagingAndMillingDoc{
		ID:         msg.GetId(),
		Name:       "Packaging/Milling " + msg.GetId(),
		ProtoBytes: bytes,
	}, nil
}

// SupplierDoc wraps a supplier document for Firestore storage
type SupplierDoc struct {
	ID         string `firestore:"id"`
	Name       string `firestore:"name"`
	ProtoBytes []byte `firestore:"proto_bytes"`
}

// GetID returns the document ID
func (d *SupplierDoc) GetID() string {
	return d.ID
}

// GetProtoBytes returns the raw proto bytes
func (d *SupplierDoc) GetProtoBytes() []byte {
	return d.ProtoBytes
}

// GetProto unmarshals and returns the proto message
func (d *SupplierDoc) GetProto() proto.Message {
	msg := &pb.Supplier{}
	if err := proto.Unmarshal(d.ProtoBytes, msg); err != nil {
		return nil
	}
	return msg
}

// GetName returns the document name
func (d *SupplierDoc) GetName() string {
	return d.Name
}

// NewSupplierDoc creates a new SupplierDoc from a proto message
func NewSupplierDoc(msg *pb.Supplier) (*SupplierDoc, error) {
	bytes, err := proto.Marshal(msg)
	if err != nil {
		return nil, err
	}
	return &SupplierDoc{
		ID:         msg.GetId(),
		Name:       msg.GetName(),
		ProtoBytes: bytes,
	}, nil
}
