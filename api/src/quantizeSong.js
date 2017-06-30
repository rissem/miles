_ = require('underscore')

const quantizeSong = function (song) {
  beats = song.data.beats.slice()
  chords = song.data.chords.slice()
  lyrics = song.data.lyrics.slice()
  const qChords = []
  const qLyrics = []
  const qLines = []
  let currentLine = null
  for (let i = 1; i < beats.length - 1; i++) {
    let midbeat = (beats[i].time + beats[i - 1].time) / 2
    while (chords.length > 0 && chords[0].time < midbeat) {
      qChords.push({beat: i, chord: chords.shift().chord})
    }
    // breaks when first lyric is before first beat..
    while (lyrics.length > 0 && lyrics[0].time > beats[i - 1].time &&
        lyrics[0].time < beats[i].time) {
      let lyric = lyrics.shift()
      let position = (lyric.time - beats[i - 1].time) / (beats[i].time - beats[i - 1].time)
      if (lyric.startOfLine){
        if (currentLine){qLines.push(currentLine)}
        currentLine = {beat: i + position, lyrics: []}
      }
      currentLine.lyrics.push(lyric.lyric)
      qLyrics.push(({beat: i + position, lyric: lyric.lyric}))
    }
  }
  delete song.data
  return _.extend(song, {chords: qChords, lyrics: qLyrics, lines: qLines})
}

module.exports = quantizeSong
