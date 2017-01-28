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
  render () {
    return (
      <div id="songscroller">
        <Measure bar={1} currentBar={this.props.measure} currentBeat={this.props.beat} beatPercentage={this.props.beatPercentage}>
          <Chord beat={1} name="E Minor" />
          <Chord beat={3} name="D Major" />
        </Measure>
        <Measure bar={2} currentBar={this.props.measure} currentBeat={this.props.beat} beatPercentage={this.props.beatPercentage}>
          <Chord beat={1} name="G Major" />
          <Lyric beat={4} words="Well I" />
        </Measure>
        <Measure bar={3} currentBar={this.props.measure} currentBeat={this.props.beat} beatPercentage={this.props.beatPercentage}>
          <Chord beat={1} name="E Minor" />
          <Chord beat={3} name="D Major" />
          <Lyric beat={2} words="won't" />
          <Lyric beat={4} words="back" />
        </Measure>
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
      preBeats: 0
    }
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
    }, 20)
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
          this.startInterval()
        }
        return newState
      }
      newState.measure = prevState.measure + (prevState.beat === 4 ? 1 : 0)
      newState.beat = prevState.beat % 4 + 1
      newState.beatPercentage = 0
      return newState
    })
  }

  render () {
    return (
      <div id="song">
        <TimeBar title={this.props.title}
                 artist={this.props.artist}
                 bars={this.props.bars}
                 onBeat={this.onBeat}
                 measure={this.state.measure}
                 beat={this.state.beat} />
        <SongScroller measure={this.state.measure} beat={this.state.beat} beatPercentage={this.state.beatPercentage}/>
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
    this.state = {'beat': 0}
    const interval = setInterval(() => {
      let lastBeat = this.state[this.state.beat]
      if (lastBeat && (Date.now() - lastBeat) > 5000) {
        console.log('beat is over, beats are', this.state)
        let i = 1
        while (this.state[i]) {
          i++
          console.log(this.state[i] - this.state[i - 1])
        }
        clearInterval(interval)
      }
    }, 1000)
  }

  render () {
    return (
      <div>
        <h2>Beat Recorder</h2>
        <audio src={this.props.songUrl} />
        <input type="button" value="beat" onMouseDown={this.onBeat}/>
      </div>
    )
  }

  onBeat () {
    this.setState((prevState, props) => {
      const newState = {}
      newState.beat = prevState.beat + 1
      newState[prevState.beat + 1] = Date.now()
      if (newState.beat === 1) {
        document.getElementsByTagName('audio')[0].play()
      }
      return newState
    })
  }
}

class ChordRecorder extends Component {
  constructor (props) {
    super()
    this.state = {chords: [], chordMapping: []}
    this.addChord = this.addChord.bind(this)
    this.startSong = this.startSong.bind(this)
    this.selectChord = this.selectChord.bind(this)
  }

  startSong () {
    document.getElementsByTagName('audio')[0].play()
    this.setState({songStart: Date.now()})
  }

  addChord () {
    this.setState((prevState, props) => {
      let chord = document.getElementById('chord').value
      document.getElementById('chord').value = ''
      return {chords: (prevState.chords || []).concat(chord)}
    })
  }

  selectChord (chord) {
    this.setState((prevState, props) => {
      return {chordMapping: prevState.chordMapping.concat({chord, time: Date.now()})}
    })
  }

  render () {
    let chordAdder = (
      <div>
        <h1>Chord Recorder</h1>
        <input id="chord" type="text" />
        <button onClick={this.addChord}>Add chord</button>
      </div>
    )

    let chordButtons = this.state.chords.map((chord) => {
      return <button onMouseDown={() => { this.selectChord(chord) }}
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
        <button onMouseDown={this.startSong} id="startSong">Start Song</button>
      </div>
    )
  }
}

class LyricRecorder extends Component {
  constructor (props) {
    super()
    this.state = {lyricMapping: []}
    this.convertLyrics = this.convertLyrics.bind(this)
    this.startSong = this.startSong.bind(this)
    this.addLyric = this.addLyric.bind(this)
  }

  startSong () {
    document.getElementsByTagName('audio')[0].play()
    this.setState({songStart: Date.now()})
  }

  convertLyrics () {
    const text = document.getElementById('pastedLyrics').value
    this.setState({lyrics: text.split(/\s+/)})
  }

  addLyric () {
    this.setState((prevState, props) => {
      const lyric = prevState.lyrics.shift()
      const lyricMapping = prevState.lyricMapping.concat({
        lyric,
        time: Date.now()
      })
      return {lyrics: prevState.lyrics, lyricMapping}
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
        return <button onClick={this.addLyric} key={lyric + i}>{lyric}</button>
      })
      return (
        <div>
          <h1>Lyric Recorder</h1>
          <div key="songStarterDiv"><button key="songStarter" onClick={this.startSong}>Start song</button></div>
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
        />
        <BeatRecorder songUrl="/tomPettywillnotbackdown.m4a" />
        <ChordRecorder songUrl="/tomPettywillnotbackdown.m4a" />
        <LyricRecorder songUrl="/tomPettywillnotbackdown.m4a" />
      </div>
    )
  }
}

export default App
