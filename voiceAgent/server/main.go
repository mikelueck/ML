package main

import (
	"context"
	"fmt"
	"log"

	"github.com/ML/voiceAgent/server/detect"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"google.golang.org/protobuf/proto"
	"net/http"

	pb "github.com/ML/voiceAgent/proto"
	dialogflowpb "cloud.google.com/go/dialogflow/cx/apiv3beta1/cxpb"
)

// Upgrader is used to upgrade HTTP connections to WebSocket connections.
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func handleMessage(ctx context.Context, msg *pb.Interaction) (*pb.Interaction, error) {
  sessionId := msg.GetSessionId()
	sessionPath := getSessionPath(sessionId)

  var interaction *pb.Interaction
	var err error

	if msg.GetText() != "" {
    log.Printf("GetText: %v\n", msg.GetText())
		interaction, err = detect.DetectIntentText(ctx, sessionPath, msg.GetText())
	} else if msg.GetInput() != nil {
    sampleRate := msg.GetInput().GetSampleRateHertz()
    encoding := dialogflowpb.AudioEncoding(msg.GetInput().GetEncoding())

		interaction, err = detect.DetectIntentStreamAudioBytes(ctx, sessionPath, msg.GetInput().GetAudioData(), encoding, sampleRate)
	}

	if err != nil {
    log.Printf("Error: %v\n", err)
		return nil, err
	}
  if interaction != nil {
    interaction.SessionId = sessionId
  }
	return interaction, nil
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	// Upgrade the HTTP connection to a WebSocket connection
  upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading:", err)
		return
	}
	defer conn.Close()

	ctx := context.Background()
	// Listen for incoming messages
	for {
		// Read message from the client
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading message:", err)
			break
		}
		msg := &pb.Interaction{}
		if err := proto.Unmarshal(message, msg); err != nil {
			log.Println("Error unmarshalling message: %v %v\n", message, err)
		}

		outMsg, err := handleMessage(ctx, msg)
		if err != nil {
			log.Println("Error handling message: %v %v\n", *msg, err)
		}

		if outMsg != nil {
			bytes, err := proto.Marshal(outMsg)
			if err != nil {
				log.Println("Error marshalling message: %v %v\n", *outMsg, err)
			}

			if err := conn.WriteMessage(websocket.BinaryMessage, bytes); err != nil {
				log.Println("Error writing message: %v %v\n", *outMsg, err)
			}
		}
	}
}

func getSessionPath(id string) string {
	projectId := "voice-agent-454313"
	agentId := "c7651fa1-56ba-4fd6-ba1c-9ff233d5fc3f"
	locationId := "us-central1"

	var sessionId string
	if id == "" {
		id, _ := uuid.NewRandom()
		sessionId = id.String()
	} else {
		sessionId = id
	}

	sessionPath := fmt.Sprintf("projects/%s/locations/%s/agents/%s/sessions/%s",
		projectId,
		locationId,
		agentId,
		sessionId)
	return sessionPath
}

func main() {
	ctx := context.Background()
	detect.SetupClient(ctx)

	defer detect.Close()

	http.HandleFunc("/ws", wsHandler)
	log.Println("WebSocket server started on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Println("Error starting server:", err)
	}
}
