const hark = require('hark')

var SPEECH_DELAY_TIMEOUT = 10000;

export default class SpeechDetection {
  #player;
  #recorder;
  #events;
  #speaking;
  #recordStopTimeout;
  #onStart;
  #onEnd;
  #stopRecording;
  #ready
  constructor(stream, recorder, player, onStart, onEnd, stopRecording) {
    let options = {
       threshold: -45,
       interval: 100, // should probably be the same as timeSlice
    };
    this.#player = player;
    this.#recorder = recorder;
    this.#events = hark(stream, options);
    this.#speaking = false;
    this.#recordStopTimeout = 0;
    this.#onStart = onStart;
    this.#onEnd = onEnd;
    this.#stopRecording = stopRecording;

    let thisArg = this
    this.#events.on('speaking', this.#speakingOnEvent.bind(thisArg));
    this.#events.on('stopped_speaking', this.#speakingOffEvent.bind(thisArg));

    this.#player.playFunc = this.#Playing.bind(thisArg)
    this.#ready = true
  }

  #speakingOnEvent() {
    if (!this.#ready) {
      return
    }
    console.log('speaking')
    this.#speaking = true

    if (this.#recorder && this.#recorder.getState() == 'stopped') {
      alert("Are you speaking? Your microphone is currently off!")
    }

    if (this.#recordStopTimeout > 0) {
      clearTimeout(this.#recordStopTimeout)
      this.#recordStopTimeout = 0
    }
    if (this.#onStart) {
      this.#onStart()
    }
  }

  #speakingOffEvent() {
    if (!this.#ready) {
      return
    }
    console.log('stopped_speaking')
    this.#speaking = false

    if (this.#recorder && this.#recorder.getState() == 'recording') {
      // Set a timer before we turn off recording
      let thisArg = this
      this.#setTimer(
        this.#MaybeDisableMic.bind(thisArg), SPEECH_DELAY_TIMEOUT);
    }
    if (this.#onEnd) {
      this.#onEnd()
    }
  }

  IsSpeaking() {
    return this.#speaking
  }

  #Playing() {
      // if we have a recordStop timer started we end it
      // and ask to call the method when the audio is done
      // Here I'm trying to catch the edge case where the stop timer
      // has started, but the playing audio ends before the timer ends.
      // We really want the playing audio to delay the mic stop

      if (this.#recordStopTimeout) {
        clearTimeout(this.#recordStopTimeout)
        this.#recordStopTimeout = 0

        let thisArg = this

        this.#player.CallWhenPlayingFinished(this.#MaybeDisableAfterAudio.bind(thisArg))
      }
  }

  #setTimer(f, delay) {
      if (this.#recordStopTimeout) {
        clearTimeout(this.#recordStopTimeout)
      }
      this.#recordStopTimeout = setTimeout(f, delay)
  }

  #MaybeDisableAfterAudio() {
    if (!this.#ready) {
      return
    }
    if (this.#recorder && this.#recorder.getState() == 'recording') {
      let thisArg = this
      this.#setTimer(this.#MaybeDisableMic.bind(thisArg), SPEECH_DELAY_TIMEOUT);
    }
  }

  #MaybeDisableMic() {
    if (!this.#ready) {
      return
    }
    let thisArg = this
    // When we are playing audio we shouldn't turn off the mic
    // The customer is waiting for the audio to finish before talking
    if (this.#player.IsPlaying()) {
      this.#player.CallWhenPlayingFinished(this.#MaybeDisableAfterAudio.bind(thisArg))
    } else {
      if (!this.#speaking && this.#stopRecording) {
        this.#stopRecording();
      }
    }
  }

  destroy() {
    this.#ready = false
    console.log("Destroying SpeechDetector");
    this.#player = undefined;
    this.#events.stop();
    // Set the events to dummy functions
    this.#events.on('speaking', function() {})
    this.#events.on('stopped_speaking', function() {})

    this.#events = undefined;
    this.#recorder = undefined;
    this.#speaking = false;
    if (this.#recordStopTimeout) {
      clearTimeout(this.#recordStopTimeout)
    }
    this.#recordStopTimeout = 0;
    this.#onStart = undefined;
    this.#onEnd = undefined;
    this.#stopRecording = undefined;
  }

}
