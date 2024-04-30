package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"strconv"

	pb "github.com/Chorus-Development/Chorus/chat/proto"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

var (
	grpcport = flag.String("grpcport", ":8082", "grpcport")
)

type TestRoom struct {
	room     *pb.Room
	users    map[string]bool
	messages []*pb.Message
}

func newTestRoom(room *pb.Room) *TestRoom {
	return &TestRoom{room: room,
		users: make(map[string]bool)}
}

type TestArtist struct {
	artist *pb.Artist
	rooms  []*TestRoom
}

// implementation of ChatService
type server struct {
	rooms   []*TestRoom
	users   []*pb.User
	artists []*TestArtist
}

func NewArtist(name string) *pb.Artist {
	return &pb.Artist{
		Name:       name,
		ArtistSlug: name + "_slug",
	}
}

func NewUser(name string) *pb.User {
	return &pb.User{
		Name: name,
	}
}

var artists []string = []string{
	"Mary and Friends",
	"Zach and the Boyz",
	"Andy and the Candyz"}

var users []string = []string{
	"Mike",
	"Zach",
	"Andrew"}

func (s *server) init(ctx context.Context) {
	// Populate users
	for _, u := range users {
		o := NewUser(u)
		o.Id = strconv.Itoa(len(s.users))
		s.users = append(s.users, o)
	}

	// Populate artists
	for _, a := range artists {
		o := NewArtist(a)
		o.Id = strconv.Itoa(len(s.artists))
		newArtist := &TestArtist{artist: o}
		s.artists = append(s.artists, newArtist)

		// Create a default room
		room := &pb.Room{
			Name:       a + "(default room)",
			Visibility: pb.Room_Public,
			ArtistSlug: o.GetArtistSlug(),
			ArtistId:   o.GetId(),
		}

		resp, err := s.CreateRoom(ctx, &pb.CreateRoomRequest{Room: room})
		if err != nil {
			log.Print(err.Error())
		}

		newRoom := newTestRoom(resp.GetRoom())
		newArtist.rooms = append(newArtist.rooms, newRoom)

		var users []string
		// Add all the users to every room we create
		for _, u := range s.users {
			users = append(users, u.GetId())
		}

		_, _ = s.InviteUsersToRoom(ctx, &pb.InviteUsersToRoomRequest{
			RoomId:  newRoom.room.GetId(),
			UserIds: users,
		})
	}

	for _, u := range s.users {
		log.Printf("User: %s %s\n", u.GetName(), u.GetId())

		resp, err := s.GetRoomsByUser(ctx,
			&pb.GetRoomsByUserRequest{UserId: u.GetId()})
		if err != nil {
			log.Print(err.Error())
		}
		for _, r := range resp.GetRooms() {
			log.Printf("Room: %s %s\n", r.GetName(), r.GetId())
		}
	}

}

func (s *server) CreateRoom(ctx context.Context, req *pb.CreateRoomRequest) (*pb.CreateRoomResponse, error) {
	r := req.GetRoom()
	a, err := s.GetArtist(r.GetArtistId())

	if err != nil {
		return nil, err
	}

	r.Id = strconv.Itoa(len(s.rooms))
	newRoom := newTestRoom(r)
	s.rooms = append(s.rooms, newRoom)

	a.rooms = append(a.rooms, newRoom)
	return &pb.CreateRoomResponse{Room: r}, nil
}

func (s *server) GetRoom(roomId string) (*TestRoom, error) {
	r, err := strconv.Atoi(roomId)
	if err != nil || r < 0 || len(s.rooms) <= r {
		return nil, status.Error(codes.NotFound, fmt.Sprintf("Invalid room id: %s", roomId))
	}
	return s.rooms[r], nil
}

func (s *server) GetArtist(artistId string) (*TestArtist, error) {
	a, err := strconv.Atoi(artistId)
	if err != nil || a < 0 || len(s.artists) <= a {
		return nil, status.Error(codes.NotFound, fmt.Sprintf("Invalid artist id: %s", artistId))
	}
	return s.artists[a], nil
}

func (s *server) InviteUsersToRoom(ctx context.Context, req *pb.InviteUsersToRoomRequest) (*pb.InviteUsersToRoomResponse, error) {
	room, err := s.GetRoom(req.GetRoomId())
	if err != nil {
		log.Print(err.Error())
		return nil, err
	}

	for u := range req.GetUserIds() {
		if u < 0 || len(s.users) <= u {
			return nil, status.Error(codes.NotFound, fmt.Sprintf("Invalid user: %v", u))
		}
	}

	// Every thing is all good so we can add the users to the room
	for _, u := range req.GetUserIds() {
		if _, ok := room.users[u]; ok {
			// Already exists in the room ... do nothing
		} else {
			room.users[u] = false //Initially not banned
		}
	}

	return &pb.InviteUsersToRoomResponse{}, nil
}

func (s *server) GetArtistRooms(ctx context.Context, req *pb.GetArtistRoomsRequest) (*pb.GetArtistRoomsResponse, error) {
	artist, err := s.GetArtist(req.GetArtistId())
	if err != nil {
		return nil, err
	}

	var rooms []*pb.Room

	for _, r := range artist.rooms {
		rooms = append(rooms, r.room)
	}

	return &pb.GetArtistRoomsResponse{Rooms: rooms}, nil
}

func (s *server) GetRoomsByUser(ctx context.Context, req *pb.GetRoomsByUserRequest) (*pb.GetRoomsByUserResponse, error) {
	userId, err := strconv.Atoi(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.NotFound, err.Error())
	}

	if userId < 0 || len(s.users) <= userId {
		return nil, status.Error(codes.NotFound, fmt.Sprintf("Invalid user: %d", userId))
	}

	var rooms []*pb.Room

	// Naive implemenation looks at all the rooms for all the artists
	for _, a := range s.artists {
		for _, r := range a.rooms {
			if banned, ok := r.users[req.GetUserId()]; ok && !banned {
				rooms = append(rooms, r.room)
			}
		}
	}

	return &pb.GetRoomsByUserResponse{Rooms: rooms}, nil
}

func (s *server) SearchInRoom(ctx context.Context, req *pb.SearchInRoomRequest) (*pb.SearchInRoomResponse, error) {
	return &pb.SearchInRoomResponse{}, status.Error(codes.Unimplemented, "not implemented")
}

func (s *server) SyncRoom(ctx context.Context, req *pb.SyncRoomRequest) (*pb.SyncRoomResponse, error) {
	room, err := s.GetRoom(req.GetRoomId())
	if err != nil {
		return nil, err
	}

	// TODO we should consider the since argument
	// TODO we should consider pagination

	return &pb.SyncRoomResponse{Messages: room.messages}, nil
}

func (s *server) SendTextMessage(ctx context.Context, req *pb.SendTextMessageRequest) (*pb.SendTextMessageResponse, error) {
	room, err := s.GetRoom(req.GetRoomId())
	if err != nil {
		return nil, err
	}

	msg := req.GetMessage()
	msg.Id = strconv.Itoa(len(room.messages))
	room.messages = append(room.messages, msg)

	return &pb.SendTextMessageResponse{MessageId: msg.GetId()}, status.Error(codes.Unimplemented, "not implemented")
}

func (s *server) UploadFile(ctx context.Context, req *pb.UploadFileRequest) (*pb.UploadFileResponse, error) {
	return &pb.UploadFileResponse{}, status.Error(codes.Unimplemented, "not implemented")
}

func (s *server) ReactToMessage(ctx context.Context, req *pb.ReactToMessageRequest) (*pb.ReactToMessageResponse, error) {
	return &pb.ReactToMessageResponse{}, status.Error(codes.Unimplemented, "not implemented")
}

func (s *server) PinMessage(ctx context.Context, req *pb.PinMessageRequest) (*pb.PinMessageResponse, error) {
	return &pb.PinMessageResponse{}, status.Error(codes.Unimplemented, "not implemented")
}

func (s *server) DeleteMessage(ctx context.Context, req *pb.DeleteMessageRequest) (*pb.DeleteMessageResponse, error) {
	return &pb.DeleteMessageResponse{}, status.Error(codes.Unimplemented, "not implemented")
}

func (s *server) BanUser(ctx context.Context, req *pb.BanUserRequest) (*pb.BanUserResponse, error) {
	return &pb.BanUserResponse{}, status.Error(codes.Unimplemented, "not implemented")
}

var _ pb.ChatServiceServer = &server{}
