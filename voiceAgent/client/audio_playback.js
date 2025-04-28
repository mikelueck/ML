
export default class Playback {
  constructor(audioTag) {
    this.audioTag = audioTag;
    this.playing = false
    this.playFunc = undefined
    this.ended = false
    this.endFunc = undefined
  }

  PlayAudio(audioBlob) {
    let src = URL.createObjectURL(audioBlob)

    let newAudio = document.createElement('audio');
    newAudio.autoplay = true;

    newAudio.onended = (event) => {
      this.#handleEnd()
    };

    newAudio.onplay = (event) => {
      console.log('start audio')
      this.playing = true;
      this.ended = false;
      if (this.playFunc) {
        this.playFunc()
      }
    };

    if(src) {
        newAudio.src = src;
    }
    
    let parentNode = this.audioTag.parentNode;
    parentNode.innerHTML = '';
    parentNode.appendChild(newAudio);

    this.audioTag = newAudio;
  }

  #handleEnd() {
    console.log('end audio')
    this.playing = false;
    this.ended = true;
    if (this.endFunc) {
      this.endFunc()
      this.endFunc = undefined
    }
  }

  CallWhenPlayingFinished(f) {
    this.endFunc = f
  }

  IsPlaying() {
    return this.playing
  }

  StopPlayback() {
    this.audioTag.src = ""
    this.#handleEnd()
  }
}
