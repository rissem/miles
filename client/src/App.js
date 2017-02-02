import React, { Component } from 'react'
import './App.css'

const measureWidth = 400

class TimeBar extends Component {
  render () {
    return (
      <div id="timeBar">
        <h3>{this.props.title} - {this.props.artist}</h3>
        <button onMouseDown={this.props.onBeat}>Triangle</button>
        <div>{this.props.measure}</div>
        <div>{this.props.beat}</div>
      </div>
    )
  }
}

class SongScroller extends Component {
  constructor (props) {
    super()
    this.state = {beats: []}
  }

  chords (start, end) {
    return this.props.chords.filter((chord) =>
      chord.time > start && chord.time < end
    ).map((chord) => {
      const beat = (chord.time - start) / (end - start) * 4 + 1
      return <Chord key={beat} beat={beat} name={chord.chord} />
    })
  }

  lyrics (start, end) {
    return this.props.lyrics.filter((lyric) =>
      lyric.time > start && lyric.time < end
    ).map((lyric) => {
      const beat = (lyric.time - start) / (end - start) * 4 + 1
      return <Lyric key={beat} beat={beat} words={lyric.lyric} />
    })
  }

  measures () {
    const measures = []
    for (let measure = 1; measure < Math.ceil(this.props.beats.length / 4); measure++) {
      const measureStart = this.props.beats[(measure - 1) * 4].time
      const measureEnd = this.props.beats[measure * 4].time
      measures.push(
        <Measure key={measure} bar={measure}>
          {this.chords(measureStart, measureEnd)}
          {this.lyrics(measureStart, measureEnd)}
        </Measure>
      )
    }
    return measures
  }

  render () {
    return (
      <div id="songscroller">
        {this.measures()}
        <div style={{clear: 'both'}} />
      </div>

    )
  }
}

class Chord extends Component {
  render () {
    return <span style={{top: 5, left: (this.props.beat - 1) / 4.0 * measureWidth}} className="chord">{this.props.name}</span>
  }
}

class Lyric extends Component {
  position () {
    return {top: 80, left: (this.props.beat - 1) / 4.0 * measureWidth}
  }

  render () {
    // let position = this.position()
    return <span className="lyric" style={this.position()}>{this.props.words}</span>
  }
}

class Measure extends Component {
  render () {
    let marker = null
    if (this.props.beatPercentage && this.props.bar === this.props.currentBar) {
      const beatPercentage = this.props.beatPercentage > 1 ? 1 : this.props.beatPercentage
      const markerPosition = (this.props.currentBeat - 1 + beatPercentage * 0.90) * 0.25 * measureWidth
      marker = <div id="marker" style={{left: markerPosition}} />
    }
    return (
      <span className="measure" style={{width: measureWidth}}>
        {this.props.children}
        {/*  beats 2, 3, 4 */}
        <div className="beat" style={{left: 0.25 * measureWidth}}/>
        <div className="beat" style={{left: 0.50 * measureWidth}}/>
        <div className="beat" style={{left: 0.75 * measureWidth}}/>
        {marker}
      </span>
    )
  }
}

class Song extends Component {
  constructor (props) {
    super(props)
    this.onBeat = this.onBeat.bind(this)
    this.state = {
      measure: 1,
      beat: 1,
      preBeats: 0,
      beats: [],
      chords: [],
      lyrics: []
    }
    this.startSong = this.startSong.bind(this)
    this.print = this.print.bind(this)
    this.chordRecorder = this.chordRecorder.bind(this)
    this.beatRecorder = this.beatRecorder.bind(this)
    this.lyricRecorder = this.lyricRecorder.bind(this)
    this.beats = []
    this.chords = []
    this.lyrics = []
  }

  componentWillUnmount () {
    clearInterval(this.beatUpdateInterval)
  }

  startInterval () {
    setInterval(() => {
      this.setState((prevState, props) => {
        let beatPercentage = (Date.now() - prevState.lastBeat) / prevState.beatSize
        if (beatPercentage > 1) {
          console.log(prevState)
        }
        return {beatPercentage}
      })
    }, 2000)
  }

  onBeat () {
    this.setState((prevState, props) => {
      const newState = {}
      if (prevState.lastBeat) {
        newState.beatSize = Date.now() - prevState.lastBeat
      }
      newState.lastBeat = Date.now()
      if (prevState.preBeats <= 4) {
        newState.preBeats = prevState.preBeats + 1
        if (prevState.preBeats === 4) {
          newState.playing = true
          clearInterval(this.interval)
          this.interval = this.startInterval()
        }
        return newState
      }
      newState.measure = prevState.measure + (prevState.beat === 4 ? 1 : 0)
      newState.beat = prevState.beat % 4 + 1
      newState.beatPercentage = 0
      return newState
    })
  }

  startSong () {
    setTimeout(() => {
      const player = document.getElementsByTagName('audio')[0]
      player.currentTime = 0
      player.play()
      this.setState({songStart: Date.now()})
    }, 500)
  }

  beatRecorder () {
    this.setState((prevState, props) => {
      return {beats: prevState.beats.concat({time: Date.now() - this.state.songStart})}
    })
  }

  chordRecorder (chord) {
    this.setState((prevState, props) => {
      return {chords: prevState.chords.concat({time: Date.now() - this.state.songStart, chord})}
    })
  }

  lyricRecorder (lyric) {
    this.setState((prevState, props) => {
      return {lyrics: prevState.lyrics.concat({time: Date.now() - this.state.songStart, lyric})}
    })
  }

  print () {
    console.log(JSON.stringify({beats: this.state.beats, chords: this.state.chords, lyrics: this.state.lyrics}))
  }

  render () {
    return (
      <div id="song">
        <audio src={this.props.songUrl} />
        <button onMouseDown={this.startSong} id="startSong">Start Song</button>
        <button onClick={this.print}>Print</button>
        <TimeBar title={this.props.title}
                 artist={this.props.artist}
                 bars={this.props.bars}
                 onBeat={this.onBeat}
                 measure={this.state.measure}
                 beat={this.state.beat} />
        <BeatRecorder songStart={this.state.songStart} beatRecorder={this.beatRecorder}/>
        <ChordRecorder songStart={this.state.songStart} chordRecorder={this.chordRecorder}/>
        <LyricRecorder songStart={this.state.songStart} lyricRecorder={this.lyricRecorder}/>
        <SongScroller measure={this.state.measure}
          beat={this.state.beat}
          beatPercentage={this.state.beatPercentage}
          chords={this.state.chords}
          lyrics={this.state.lyrics}
          beats={this.state.beats}
        />
      </div>
    )
  }
}

Song.propTypes = {
  bpm: React.PropTypes.number
}

class BeatRecorder extends Component {
  constructor (props) {
    super()
    this.onBeat = this.onBeat.bind(this)
    this.state = {'beats': []}
  }

  render () {
    return (
      <div>
        <h1>Beat Recorder</h1>
        <input type="button" value="beat" onMouseDown={this.props.beatRecorder}/>
      </div>
    )
  }

  onBeat () {
    this.setState((prevState, props) => {
      return {beats: prevState.beats.concat(Date.now())}
    })
  }
}

class ChordRecorder extends Component {
  constructor (props) {
    super()
    this.state = {chords: []}
    this.addChord = this.addChord.bind(this)
  }

  addChord () {
    this.setState((prevState, props) => {
      let chord = document.getElementById('chord').value
      document.getElementById('chord').value = ''
      return {chords: (prevState.chords || []).concat(chord)}
    })
  }

  render () {
    let chordAdder = (
      <div>
        <h1>Chord Recorder</h1>
        <input id="chord" type="text" />
        <button onMouseDown={this.addChord}>Add chord</button>
      </div>
    )

    let chordButtons = this.state.chords.map((chord) => {
      return <button onMouseDown={() => { this.props.chordRecorder(chord) }}
        style={{margin: 20}} key={chord}>{chord}</button>
    })
    let chordSetter = (
      <div>
        {chordButtons}
      </div>
    )
    return (
      <div>
        {chordAdder}
        {chordSetter}
      </div>
    )
  }
}

class LyricRecorder extends Component {
  constructor (props) {
    super()
    this.convertLyrics = this.convertLyrics.bind(this)
    this.addLyric = this.addLyric.bind(this)
    this.state = {}
  }

  convertLyrics () {
    const text = document.getElementById('pastedLyrics').value
    this.setState({lyrics: text.split(/\s+/)})
  }

  addLyric () {
    this.setState((prevState, props) => {
      const lyric = prevState.lyrics.shift()
      this.props.lyricRecorder(lyric)
      return {lyrics: prevState.lyrics}
    })
  }

  render () {
    if (!this.state.lyrics) {
      return (
      <div>
        <h1>Lyric Recorder</h1>
        <textarea id="pastedLyrics"></textarea>
        <button onClick={this.convertLyrics}>Submit Lyrics</button>
      </div>
      )
    } else {
      let i = 0
      const buttons = this.state.lyrics.map((lyric) => {
        i += 1
        return <button onMouseDown={this.addLyric} key={lyric + i}>{lyric}</button>
      })
      return (
        <div>
          <h1>Lyric Recorder</h1>
          {buttons}
        </div>
      )
    }
  }
}

class App extends Component {
  render () {
    return (
      <div>
        <Song title="I won't back down"
          artist="Tom Petty & the Heartbreakers"
          bars="140"
          songUrl="/tomPettywillnotbackdown.m4a"
        />
      </div>
    )
  }
}

export default App
