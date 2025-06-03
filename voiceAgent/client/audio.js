const pb = require('../proto/messages_pb.js');
const RecordRTC = require('recordrtc')
const { StereoAudioRecorder } = require('recordrtc')
const { create, toBinary, fromBinary} = require('@bufbuild/protobuf')
const conversation = require('./elevenlabs.js');

let startRecording = document.getElementById('start-recording');
let stopRecording = document.getElementById('stop-recording');
let recordAudio;
 
let ws;
let sessionId = crypto.randomUUID()

import Playback from './audio_playback.js';
import logger from './logger.js';
let player = new Playback(document.getElementsByTagName('audio')[0]);

import SpeechDetection from './speech_detection.js';
let speechDetector

startRecording.onclick = function() {
   startRecording.disabled = true;

   navigator.getUserMedia({
       audio: true
   }, function(stream) {
       recordAudio = RecordRTC(stream, {
           type: 'audio',

           sampleRate: 44100,
           // used by StereoAudioRecorder
           // the range 22050 to 96000.
           // let us force 16khz recording:
           desiredSampRate: SAMPLE_RATE,
           bufferSize: 4096,
        
           // MediaStreamRecorder, StereoAudioRecorder, WebAssemblyRecorder
           // CanvasRecorder, GifRecorder, WhammyRecorder
           recorderType: StereoAudioRecorder,
           // Dialogflow / STT requires mono audio
           numberOfAudioChannels: 1,
           timeSlice: 100, // provide audio every 100ms
           ondataavailable: function(blob) {
              processAudio(blob);
           },
       });

       speechDetector = new SpeechDetection(
         stream, 
         recordAudio, 
         player, 
         function() {}, // onStart
         function() {   // onEnd
              let msg = buildInteractionFromAudio()

              // Send an empty buffer which triggers end of input
              logger.log("Sending 0 bytes")
              ws.send(toBinary(pb.InteractionSchema, msg))
         },
         stopRecording.onclick // stopRecording
         );

       recordAudio.startRecording();
       stopRecording.disabled = false;
   }, function(error) {
       logger.error(JSON.stringify(error));
   });
};

function buildInteractionFromAudio(byteArray) {
    let msg = create(pb.InteractionSchema, {});
    if (sessionId) {
      msg.sessionId = sessionId;
    }

    let audio = create(pb.InputAudioSchema,{});
    audio.encoding = pb.InputAudio_AudioEncoding.LINEAR_16;
    audio.sampleRateHertz = recordAudio.sampleRate;
    if (byteArray) {
      audio.audioData = byteArray
    }

    msg.Audio = {case: "input", value: audio};
    return msg
}

function processAudio(blob) {
  blob.arrayBuffer().then(buffer => {
    let bytes = new Uint8Array(buffer)
    if (bytes.length == 0) {
      logger.log("Skipping this as it is 0 bytes long")
      return
    }
    let msg = buildInteractionFromAudio(bytes)

    // submit the audio file to the server
    ws.send(toBinary(pb.InteractionSchema, msg))
  });
}

stopRecording.onclick = function() {

     // recording stopped
     startRecording.disabled = false;
     stopRecording.disabled = true;

     // stop audio recorder
     recordAudio.stopRecording(function() {
        // after stopping the audio, get the audio data
        //processAudio(recordAudio.getBlob())
     });

     if (speechDetector) {
       speechDetector.destroy()
       speechDetector = undefined
     }

     if (!recordAudio) {
       recordAudio.destroy()
       recordAudio = undefined
     }
 };
 

function connect() {
    ws = new WebSocket("ws://localhost:8080/ws");
  
    ws.binaryType = "arraybuffer"

    ws.onopen = function() {
        logger.log("connected to websocket server");
    };

    ws.onmessage = function(event) {
        var interaction = fromBinary(pb.InteractionSchema, new Uint8Array(event.data));

        if (!interaction.isPartial) {
          logger.log("got message, Playing: " + player.IsPlaying())
          if (interaction.Audio && interaction.Audio.case == "output") {
            let blob = new Blob([interaction.Audio.value.audioData], 
                {type: "audio/wav"})
            player.PlayAudio(blob)
          }

          sessionId = interaction.sessionId;

          let messagedisplay = document.getElementById("messages");
          if (interaction.recognizedText) {
            logger.log(interaction.text)
            messagedisplay.innerHTML += `<p>>>> ${interaction.recognizedText}</p>`;
          }
          if (interaction.text) {
            messagedisplay.innerHTML += `<p>${interaction.text}</p>`;
          }
        } else {
          // For partial responses we assume this is "barge in" and we stop 
          // the audio
          if (player.IsPlaying()) {
            logger.log("Barging in...");
            player.StopPlayback()
          }
          // TODO we can maybe show some of the early transcription results
        }
    };

    ws.onclose = function() {
        logger.log("websocket connection closed, retrying...");
        setTimeout(connect, 1000); // reconnect after 1 second
    };

    ws.onerror = function(error) {
        logger.error("websocket error:", error);
    };

    startRecording.disabled = false;
}

connect();

function sendMessage() {
    let input = document.getElementById("messageInput");

    let msg = create(pb.InteractionSchema, {});
    if (sessionId != "") {
      msg.setSessionId(sessionId);
    }

    msg.setText(input.value);

    ws.send(msg.encode().finish());
    input.value = "";
}

const SAMPLE_RATE = 16000;
 
