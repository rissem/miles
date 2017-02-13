const quantizeSong = function ({beats, chords, lyrics}) {
  beats = beats.slice()
  chords = chords.slice()
  lyrics = lyrics.slice()
  const qChords = []
  const qLyrics = []
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
      qLyrics.push(({beat: i + position, lyric: lyric.lyric}))
    }
  }
  
  console.log(beats)
  console.log(qChords)
  console.log(qLyrics)
  return {
    chords: qChords,
    lyrics: qLyrics
  }
}

const utils = {quantizeSong}

export default utils
