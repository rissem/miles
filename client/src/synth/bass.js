const bass = {
  play: (hertz, length)=>{
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

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
    oscillator.frequency.value = 80; // value in hertz
    oscillator.connect(gainNode);
    gainNode.connect(biquadFilter)
    biquadFilter.connect(audioCtx.destination)
    oscillator.start();
  }
}

export default bass
