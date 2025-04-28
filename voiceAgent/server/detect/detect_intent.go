package detect

import (
	dialogflow "cloud.google.com/go/dialogflow/cx/apiv3beta1"
	dialogflowpb "cloud.google.com/go/dialogflow/cx/apiv3beta1/cxpb"
	"google.golang.org/api/option"

	"context"
	"fmt"
	"log"

	"github.com/ML/voiceAgent/server/functions"
	"github.com/ML/voiceAgent/sessions"
	pb "github.com/ML/voiceAgent/proto"
)

var SessionClient *dialogflow.SessionsClient

func SetupClient(ctx context.Context) error {
	var err error
	endpoint := "us-central1-dialogflow.googleapis.com:443"
	SessionClient, err = dialogflow.NewSessionsClient(ctx, option.WithEndpoint(endpoint))
	if err != nil {
		return err
	}
	return nil
}

func Close() {
	SessionClient.Close()
}

func HandleFunctionCallsIfNeeded(ctx context.Context, sessionPath string, queryResult *dialogflowpb.QueryResult) (*dialogflowpb.QueryResult, error) {
	for _, rm := range queryResult.GetResponseMessages() {
		if rm.GetToolCall() != nil {
			log.Printf("ToolCall %v\n", *rm.GetToolCall())
			queryInput, err := MakeQueryInputFromFuncResults(rm.GetToolCall())
			log.Printf("Passing the results of the function: %v\n", queryInput)
			if err != nil {
				log.Printf("error: %v\n", err)
				return nil, err
			}

			request := dialogflowpb.DetectIntentRequest{
				Session:    sessionPath,
				QueryInput: queryInput,
        OutputAudioConfig: getOutputAudioConfig(),
			}

			response, err := SessionClient.DetectIntent(ctx, &request)
			if err != nil {
				log.Printf("error: %v\n", err)
				return nil, err
			}
			return response.GetQueryResult(), nil
		}
	}
	return queryResult, nil
}

func GetPartialInteraction(recognitionResult *dialogflowpb.StreamingRecognitionResult) (*pb.Interaction, error) {
  var retval *pb.Interaction
  if recognitionResult != nil {
    if recognitionResult.GetMessageType() == dialogflowpb.StreamingRecognitionResult_TRANSCRIPT && recognitionResult.GetTranscript() != "" {
      // Maybe only care about final results?
      retval = &pb.Interaction{
        IsPartial: true,
        Text: recognitionResult.GetTranscript(),
      }
    }

    // Results here include partial and final results.
    // See: https://github.com/googleapis/google-cloud-go/blob/dialogflow/v1.68.1/dialogflow/cx/apiv3beta1/cxpb/session.pb.go#L1243
    // concatenting the IsFinal results will give the full transcript
    // TODO concatete these
    log.Printf("Recognition transcript: %s %s isFinal: %v\n", 
        recognitionResult.GetMessageType(), 
        recognitionResult.GetTranscript(),
        recognitionResult.GetIsFinal())

    // TODO could do something in here with
    // Confidence, Stability, SpeechWordInfo
  }
  return retval, nil
}

func GetResultInteraction(queryResult *dialogflowpb.QueryResult) (*pb.Interaction, error) {
	//TODO response.Query (might have QueryResult_Transcript)
	match := queryResult.GetMatch()
	// Possible match types
	// Match_INTENT
	// Match_DIRECT_INTENT
	// Match_PARAMETER_FILLING
	// Match_NO_MATCH
	// Match_NO_INPUT
	// Match_EVENT
	// Match_KNOWLEDGE_CONNECTOR
	// Match_PLAYBOOK

  retval := &pb.Interaction{IsPartial: false}

	if queryResult.GetTranscript() != "" {
    retval.RecognizedText = queryResult.GetTranscript()
		log.Printf("Recognized Text: %s\n", queryResult.GetTranscript())
	}

	for i, rm := range queryResult.GetResponseMessages() {
		log.Printf("ResponseMessage %d:\n", i)
		if rm.GetPayload() != nil {
			log.Printf("Payload %v\n", *rm.GetPayload())
		} else if rm.GetOutputAudioText() != nil {
			log.Printf("OutputAudioText %v\n", *rm.GetOutputAudioText())
		} else if rm.GetText() != nil {
      retval.Text = rm.GetText().GetText()[0]
			log.Printf("Text %v\n", rm.GetText())
		} else if rm.GetConversationSuccess() != nil {
			log.Printf("ConversationSuccess %v\n", *rm.GetConversationSuccess())
		} else if rm.GetOutputAudioText() != nil {
			log.Printf("OutputAudioText %v\n", *rm.GetOutputAudioText())
		} else if rm.GetEndInteraction() != nil {
			log.Printf("EndInteraction %v\n", *rm.GetEndInteraction())
		} else if rm.GetPlayAudio() != nil {
			log.Printf("PlayAudio %v\n", *rm.GetPlayAudio())
		} else if rm.GetMixedAudio() != nil {
      retval.Audio = &pb.Interaction_Output{
        Output: &pb.OutputAudio{
          Encoding: pb.OutputAudio_LINEAR_16,
          AudioData: rm.GetMixedAudio().GetSegments()[0].GetAudio(),
        },
      }
			log.Printf("MixedAudio:\n")
      log.Printf("Number of segments: %s\n", len(rm.GetMixedAudio().GetSegments()))
		} else if rm.GetLiveAgentHandoff() != nil {
			log.Printf("LiveAgentHandoff %v\n", *rm.GetLiveAgentHandoff())
		} else if rm.GetTelephonyTransferCall() != nil {
			log.Printf("TelephonyTransferCall %v\n", *rm.GetTelephonyTransferCall())
		} else if rm.GetKnowledgeInfoCard() != nil {
			log.Printf("KnowledgeInfoCard %v\n", *rm.GetKnowledgeInfoCard())
			//} else if rm.GetToolCall() != nil {
			//log.Printf("ToolCall %v\n", *rm.GetToolCall())
		} else {
			log.Printf("Unknown data %v\n", *rm)
		}
	}

	if match != nil {
		log.Printf("Got Match: %v\n", *match)
		log.Printf("Got Match Event: %v\n", match.GetEvent())
		if match.GetParameters() != nil {
			log.Printf("MatchParameters: %v\n", *match.GetParameters())
		}
		log.Printf("ResolvedInput: %v\n", match.GetResolvedInput())
		log.Printf("MatchType: %v\n", match.GetMatchType())

		if match.GetMatchType() == dialogflowpb.Match_INTENT {
			log.Printf("Got Intent: %v\n", *match.GetIntent())
		}
	}

	//TODO OutputAudio
	//TODO OutputAudioConfig (same as above probably)
	//TODO AllowCancellation
	return retval, nil
}

func MakeQueryInputFromFuncResults(call *dialogflowpb.ToolCall) (*dialogflowpb.QueryInput, error) {
	log.Printf("Calling function:\n")
	log.Printf("id: %v\n", call.GetAction())
	log.Printf("params: %v\n", *call.GetInputParameters())

	output, err := functions.CallFunc(call.GetTool(), call.GetInputParameters())

	if output != nil {
		log.Printf("results: %v\n", *output)
	}
	log.Printf("error: %v\n", err)

	result := &dialogflowpb.ToolCallResult{
		Tool:   call.GetTool(),
		Action: call.GetAction()}

	if err != nil {
		result.Result = &dialogflowpb.ToolCallResult_Error_{Error: &dialogflowpb.ToolCallResult_Error{Message: err.Error()}}
	} else {
		result.Result = &dialogflowpb.ToolCallResult_OutputParameters{OutputParameters: output}
	}

	queryInput := &dialogflowpb.QueryInput{
		Input:        &dialogflowpb.QueryInput_ToolCallResult{ToolCallResult: result},
		LanguageCode: "en", // default to english now
	}
	return queryInput, nil
}

func MakeQueryInputForAudio(encoding dialogflowpb.AudioEncoding, sampleRate int32) (*dialogflowpb.QueryInput, error) {
	// In this example, we hard code the encoding and sample rate for simplicity.
	audioConfig := dialogflowpb.InputAudioConfig{
		AudioEncoding:   encoding,
		SampleRateHertz: sampleRate,
		//TODO EnableWordInfo:
		//TODO PhraseHints
    /* This will be taken from the agent configuration
    // Models are here: https://cloud.google.com/speech-to-text/docs/transcription-model
    // Model: "telephony_short",
		//TODO ModelVariant
		//TODO BargeInConfig
    */
    SingleUtterance: true,
	}

	queryAudioInput := &dialogflowpb.AudioInput{
		Config: &audioConfig}

	queryInput := dialogflowpb.QueryInput{
		Input:        &dialogflowpb.QueryInput_Audio{Audio: queryAudioInput},
		LanguageCode: "en", // default to english now
	}
	return &queryInput, nil
}

// [START dialogflow_detect_intent_text]
func DetectIntentText(ctx context.Context, sessionPath, text string) (*pb.Interaction, error) {
	textInput := dialogflowpb.TextInput{Text: text}
	queryTextInput := dialogflowpb.QueryInput_Text{Text: &textInput}
	queryInput := dialogflowpb.QueryInput{Input: &queryTextInput, LanguageCode: "en"}
	request := dialogflowpb.DetectIntentRequest{Session: sessionPath, QueryInput: &queryInput}

	response, err := SessionClient.DetectIntent(ctx, &request)
	if err != nil {
		return nil, err
	}

	queryResult := response.GetQueryResult()

	queryResult, err = HandleFunctionCallsIfNeeded(ctx, sessionPath, queryResult)
	if err != nil {
		return nil, err
	}

	return GetResultInteraction(queryResult)
}

// [END dialogflow_detect_intent_text]

func getOutputAudioConfig() *dialogflowpb.OutputAudioConfig {
  return &dialogflowpb.OutputAudioConfig{
    AudioEncoding: dialogflowpb.OutputAudioEncoding_OUTPUT_AUDIO_ENCODING_LINEAR_16,
    SampleRateHertz: 16000,
    /* This is not need and will be chosen by the agent
    SynthesizeSpeechConfig: &dialogflowpb.SynthesizeSpeechConfig{
      SpeakingRate: 1.0, // [0.25, 4.0]
      Pitch: 0, // [-20, 20]
      VolumeGainDb: 0, // [-96.0, 16.0]
      EffectsProfileId: []string{"telephony-class-application"}, // https://cloud.google.com/text-to-speech/docs/audio-profiles
      Voice: &dialogflowpb.VoiceSelectionParams{
        Name: "Aoede", // https://cloud.google.com/text-to-speech/docs/voices
        SsmlGender: dialogflowpb.SsmlVoiceGender_SSML_VOICE_GENDER_UNSPECIFIED,
      },
    },
    */
  }
}

/*
func DetectIntentStream(ctx context.Context, sessionPath, audioFile string) (*pb.Interaction, error) {
  encoding := dialogflowpb.AudioEncoding_AUDIO_ENCODING_LINEAR_16
  sampleRate := int32(16000)
	queryInput, err := MakeQueryInputForAudio(encoding, sampleRate)

  streamer, ok := sessions.GetStreamerForSession(sessionPath)
  if !ok {
    newStreamer, err := SessionClient.StreamingDetectIntent(ctx)
    if err != nil {
      return nil, err
    }
    sessions.AddStreamerToSession(sessionPath, newStreamer)
    streamer = newStreamer
  }
  
	f, err := os.Open(audioFile)
	if err != nil {
		return nil, err
	}

	defer f.Close()

	go func() {
		audioBytes := make([]byte, 1024)

		request := dialogflowpb.StreamingDetectIntentRequest{
			Session: sessionPath,
			//TODO QueryParams
			QueryInput: queryInput,
			//TODO OutputAudioConfig
		}

		err = streamer.Send(&request)
		if err != nil {
			log.Fatal(err)
		}

		for {
			_, err := f.Read(audioBytes)
			if err == io.EOF {
				streamer.CloseSend()
				break
			}
			if err != nil {
				log.Fatal(err)
			}
			queryAudioInput := &dialogflowpb.AudioInput{Audio: audioBytes}
			queryInput := &dialogflowpb.QueryInput{
				Input: &dialogflowpb.QueryInput_Audio{Audio: queryAudioInput},
			}

			request = dialogflowpb.StreamingDetectIntentRequest{QueryInput: queryInput}
			err = streamer.Send(&request)
			if err != nil {
				log.Fatal(err)
			}
		}
	}()

	var queryResult *dialogflowpb.QueryResult

	for {
		response, err := streamer.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatal(err)
		}

		recognitionResult := response.GetRecognitionResult()
		transcript := recognitionResult.GetTranscript()
		log.Printf("Recognition transcript: %s\n", transcript)

		queryResult = response.GetDetectIntentResponse().GetQueryResult()
	}

	queryResult, err = HandleFunctionCallsIfNeeded(ctx, sessionPath, queryResult)
	if err != nil {
		return nil, err
	}

	return GetResultInteraction(queryResult)
}
*/

func streamAudioBytes(ctx context.Context, streamer sessions.StreamInterface, sessionPath string, audioBytes []byte, encoding dialogflowpb.AudioEncoding, sampleRate int32) error {
  fmt.Printf(">")
  if len(audioBytes) == 0 {
    log.Printf("Received 0 bytes\n")
    streamer.CloseSend()
    return nil
  }
	queryInput, err := MakeQueryInputForAudio(encoding, sampleRate)

  request := dialogflowpb.StreamingDetectIntentRequest{
    Session: sessionPath,
    //TODO QueryParams
    QueryInput: queryInput,
    OutputAudioConfig: getOutputAudioConfig(),
  }

	queryInput.GetAudio().Audio = audioBytes

  request = dialogflowpb.StreamingDetectIntentRequest{QueryInput: queryInput}
  err = streamer.Send(&request)
  if err != nil {
    log.Printf("Error sending audio: %v\n", err)
    return err
  }
  return nil
}


// From the following description: 
// https://github.com/googleapis/google-cloud-go/blob/dialogflow/v1.68.1/dialogflow/cx/apiv3beta1/cxpb/session.pb.go#L746
// We need to initialize a streamer
// then repeatedly send audio bytes
// 
// So first we see if we have a streamer in the session
// if not create one and then stream audio
// otherwise just stream audio
//
func DetectIntentStreamAudioBytes(ctx context.Context, sessionPath string, audioBytes []byte, encoding dialogflowpb.AudioEncoding, sampleRate int32) (*pb.Interaction, error) {
	queryInput, err := MakeQueryInputForAudio(encoding, sampleRate)

  streamer, ok := sessions.GetStreamerForSession(sessionPath)
  if !ok {
    log.Printf("Creating a new streamer\n")
    newStreamer, err := NewStreamer(ctx, sessionPath)
    if err != nil {
      return nil, err
    }
    // Initialize the streamer
    request := dialogflowpb.StreamingDetectIntentRequest{
      Session: sessionPath,
      //TODO QueryParams
      QueryInput: queryInput,
      OutputAudioConfig: getOutputAudioConfig(),
    }

    err = newStreamer.Send(&request)
    if err != nil {
      log.Printf("Error initializing streamer: %v\n", err)
      return nil, err
    }
    sessions.AddStreamerToSession(sessionPath, newStreamer)
    streamer = newStreamer
    streamer.Recv()
  }

  err = streamAudioBytes(ctx, streamer, sessionPath, audioBytes, encoding, sampleRate)
  if err != nil {
    log.Printf("Err: %v\n", err)
    sessions.ClearStreamerForSession(sessionPath)
  }

	var queryResult *dialogflowpb.QueryResult

  for {
    if streamer.Error() != nil {
      log.Printf("Got Error\n")
      streamer.Stop()
      break
    }
    if !streamer.HasResponse() {
      break
    }

    response := streamer.NextResponse()

    // We separately store intent responses
    // If we have one then we just skip to the end of the response
    // and use the intent directly
    intent := streamer.GetIntent()
    if intent != nil {
      log.Printf("Got an intent...skipping responses")
      response = intent
    }

    if response != nil {
      recognitionResult := response.GetRecognitionResult()
      if recognitionResult != nil {
        interaction, err := GetPartialInteraction(recognitionResult)
        if interaction != nil {
          return interaction, err
        }
      }

      intentResponse := response.GetDetectIntentResponse()
      if intentResponse != nil {
        log.Printf("Got Intent:%s\n", intentResponse.GetResponseType())
        queryResult = intentResponse.GetQueryResult()

        // Save the recognized text here in case we have to do tools
        // calls.  The resulting queryResult will lose these transcription
        // results
        originalRecognizedText := queryResult.GetTranscript()

        queryResult, err = HandleFunctionCallsIfNeeded(ctx, sessionPath, queryResult)
        // On successful intent detection we should start a new stream
        interaction,err := GetResultInteraction(queryResult)
        if interaction.GetRecognizedText() == "" {
          interaction.RecognizedText = originalRecognizedText
        }
        defer sessions.ClearStreamerForSession(sessionPath)

        return interaction, err
      }
    }
  }

  return nil, nil
}

// [END dialogflow_detect_intent_streaming]
