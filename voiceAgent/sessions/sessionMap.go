package sessions

import (
	"fmt"
	"sync"

	dialogflowpb "cloud.google.com/go/dialogflow/cx/apiv3beta1/cxpb"
)

type (
	StreamInterface interface {
		Send(*dialogflowpb.StreamingDetectIntentRequest) error
		Recv()
		Stop()
		CloseSend()
		HasResponse() bool
		GetIntent() *dialogflowpb.StreamingDetectIntentResponse
		NextResponse() *dialogflowpb.StreamingDetectIntentResponse
		Error() error
	}
)

type SessionMap struct {
	sync.RWMutex
	data map[string]StreamInterface
}

func NewSessionMap() *SessionMap {
	return &SessionMap{
		data: make(map[string]StreamInterface),
	}
}

func (sm *SessionMap) Get(key string) (StreamInterface, bool) {
	sm.RLock()
	defer sm.RUnlock()
	value, ok := sm.data[key]
	return value, ok
}

func (sm *SessionMap) Set(key string, value StreamInterface) {
	sm.Lock()
	defer sm.Unlock()
	sm.data[key] = value
}

func (sm *SessionMap) Delete(key string) {
	streamer, ok := sm.Get(key)
	if ok {
		fmt.Printf("Closing stream\n")
		streamer.Stop()
	}

	sm.Lock()
	defer sm.Unlock()

	delete(sm.data, key)
}
