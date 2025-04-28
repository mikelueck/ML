package detect

import (
	"context"
	"fmt"
	"log"
	"sync"

	dialogflowpb "cloud.google.com/go/dialogflow/cx/apiv3beta1/cxpb"
	"github.com/ML/voiceAgent/sessions"
)

type Streamer struct {
	lock         sync.RWMutex
	sessionPath  string
	streamClient dialogflowpb.Sessions_StreamingDetectIntentClient
	stopChan     chan struct{}
	nextIndex    int
	responses    []*dialogflowpb.StreamingDetectIntentResponse
	err          error
	isClosed     bool
	intent       *dialogflowpb.StreamingDetectIntentResponse
}

func NewStreamer(ctx context.Context, sessionPath string) (sessions.StreamInterface, error) {
	newStreamer, err := SessionClient.StreamingDetectIntent(ctx)
	if err != nil {
		return nil, err
	}
	return &Streamer{
		sessionPath:  sessionPath,
		streamClient: newStreamer,
		stopChan:     make(chan struct{}),
		nextIndex:    0,
		responses:    []*dialogflowpb.StreamingDetectIntentResponse{},
		isClosed:     false,
	}, nil
}

var _ sessions.StreamInterface = &Streamer{}

func (s *Streamer) Stop() {
	s.lock.Lock()
	defer s.lock.Unlock()
	s.streamClient.CloseSend()
	close(s.stopChan)
}

func (s *Streamer) CloseSend() {
	s.lock.Lock()
	defer s.lock.Unlock()
	log.Printf("Calling CloseSend()")
	s.streamClient.CloseSend()
	s.isClosed = true
}

func (s *Streamer) Send(req *dialogflowpb.StreamingDetectIntentRequest) error {
	s.lock.Lock()
	defer s.lock.Unlock()
	if s.isClosed {
		return nil
	}
	return s.streamClient.Send(req)
}

func (s *Streamer) HasResponse() bool {
	s.lock.RLock()
	defer s.lock.RUnlock()
	return s.nextIndex < len(s.responses)
}

func (s *Streamer) NextResponse() *dialogflowpb.StreamingDetectIntentResponse {
	s.lock.Lock()
	defer s.lock.Unlock()
	var retval *dialogflowpb.StreamingDetectIntentResponse
	if s.nextIndex < len(s.responses) {
		retval = s.responses[s.nextIndex]
		s.nextIndex++
	}
	return retval
}

func (s *Streamer) Error() error {
	s.lock.RLock()
	defer s.lock.RUnlock()
	return s.err
}

func (s *Streamer) GetIntent() *dialogflowpb.StreamingDetectIntentResponse {
	s.lock.RLock()
	defer s.lock.RUnlock()
	return s.intent
}

func (s *Streamer) addResponse(response *dialogflowpb.StreamingDetectIntentResponse) {
	s.lock.Lock()
	defer s.lock.Unlock()
	s.responses = append(s.responses, response)
	if response.GetDetectIntentResponse() != nil {
		s.intent = response
	}
}

func (s *Streamer) Recv() {
	go func() {
		for {
			select {
			case <-s.stopChan:
				fmt.Println("Recv stopping...")
				return
			default:
				response, err := s.streamClient.Recv()

				if response == nil {
					break
				}

				if err != nil {
					fmt.Printf("Error calling Recv: %v\n", err)
					sessions.ClearStreamerForSession(s.sessionPath)
				}

				// There can be multiple responses
				// https://github.com/googleapis/google-cloud-go/blob/dialogflow/v1.68.1/dialogflow/cx/apiv3beta1/cxpb/session.pb.go#L1103
				//
				// Recognition responses and intent responses

				s.addResponse(response)
			}
		}
	}()
}
