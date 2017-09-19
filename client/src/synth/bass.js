const notes = {
  'A': 110,
  'A#': 116.541,
  'B': 123.471,
  'C': 130.813,
  'D': 146.832,
  'D#': 155.563,
  'E': 164.814,
  'F': 174.614,
  'F#': 184.997,
  'G': 195.998,
  'G#': 207.652
}
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const bass = {
  play: (note, time)=>{
    // create Oscillator node
    var oscillator = audioCtx.createOscillator();
    var biquadFilter = audioCtx.createBiquadFilter();
    var gainNode = audioCtx.createGain();

    biquadFilter.type = "lowpass"
    biquadFilter.frequency.value = 800;
    biquadFilter.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.25)
    biquadFilter.Q.value = 0.2

    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5)

    oscillator.type = 'triangle';
    oscillator.frequency.value = notes[note] / 2; // value in hertz
    oscillator.connect(gainNode);
    gainNode.connect(biquadFilter)
    biquadFilter.connect(audioCtx.destination)
    oscillator.start();
  }
}

export default bass
