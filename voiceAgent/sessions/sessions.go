package sessions

import (
  "strings"
)

// Typically I hate adding state to a service.
// However since we are using Websockets we already have a
// persistent connection between client and server.
// Here we store a map from sessionId to "Streamer" so
// that we can continue streaming audio.  These streamers
// only live as long as an "intent" so they are relatively short-lived
var sessionMap *SessionMap

func init() {
  sessionMap = NewSessionMap()
}

func GetSessionIdFromPath(sessionPath string) string {
  parts := strings.Split(sessionPath, "/")
  sessionId := parts[len(parts) -1]
  return sessionId
}

func AddStreamerToSession(sessionPath string, streamer StreamInterface) {
  sessionId := GetSessionIdFromPath(sessionPath)
  sessionMap.Set(sessionId, streamer)
}

func GetStreamerForSession(sessionPath string) (StreamInterface, bool) {
  sessionId := GetSessionIdFromPath(sessionPath)
  return sessionMap.Get(sessionId)
}

func ClearStreamerForSession(sessionPath string) {
  sessionId := GetSessionIdFromPath(sessionPath)
  sessionMap.Delete(sessionId)
}
