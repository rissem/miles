const audioCtx = window.audioCtx = window.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
const buffers = {}

function getData(filename) {
  var request = new XMLHttpRequest();
  request.open('GET', filename, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    var audioData = request.response;
    audioCtx.decodeAudioData(audioData, function(buffer) {
      buffers[filename.split('.')[0]] = buffer
      },
      function(e){ console.log("Error with decoding audio data" + e); console.log(filename)});
  }

  request.send();
}

['bassDrumAcoustic.wav', 'hihat_closed.wav', 'snare.wav'].forEach((filename)=>{
  getData(filename)
})

const drums = {
  play: (drum, time)=>{
    var source = audioCtx.createBufferSource()
    source.buffer = buffers[drum]
    source.connect(audioCtx.destination)
    source.start(audioCtx.currentTime)
  }
}

export default drums
