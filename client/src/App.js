import React, { Component } from 'react'
import './App.css'
import $ from 'jquery'

window.jquery = $

const measureWidth = 400

class SongScroller extends Component {
  chords (start, end) {
    return this.props.song.data.chords.filter((chord) =>
      chord.time > start && chord.time < end
    ).map((chord) => {
      const beat = (chord.time - start) / (end - start) * 4 + 1
      return <Chord key={beat} beat={beat} name={chord.chord} />
    })
  }

  lyrics (start, end) {
    return this.props.song.data.lyrics.filter((lyric) =>
      lyric.time > start && lyric.time < end
    ).map((lyric) => {
      const beat = (lyric.time - start) / (end - start) * 4 + 1
      return <Lyric key={beat} beat={beat} words={lyric.lyric} />
    })
  }

  measures () {
    const measures = []
    const beats = this.props.song.data ? this.props.song.data.beats : []
    for (let measure = 1; measure < Math.ceil(beats.length / 4); measure++) {
      const measureStart = beats[(measure - 1) * 4].time
      const measureEnd = beats[measure * 4].time
      measures.push(
        <Measure key={measure} bar={measure} current={this.props.measure === measure} beat={this.props.beat}>
          {this.chords(measureStart, measureEnd)}
          {this.lyrics(measureStart, measureEnd)}
        </Measure>
      )
    }
    return measures
  }

  scrollToCurrent () {
    if ($('.measure.current').length === 0) {
      return
    }
    let position = $('.measure.current').position()
    let movement = position.top <= 160 ? 0 : position.top - 160
    $('#songscroller').scrollTop($('#songscroller').scrollTop() + movement)
  }

  componentDidMount () {
    setInterval(this.scrollToCurrent, 200)
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
    if (this.props.current) {
      let className = `beat${this.props.beat} marker`
      marker = (
        <div className={className} style={{'animationDuration': '0.5s'}} />
      )
    }

    const className = this.props.current ? 'measure current' : 'measure'
    return (
      <span className={className} style={{width: measureWidth}}>
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
      measure: 0,
      beat: 1,
      preBeats: 0,
      beats: [],
      chords: [],
      lyrics: []
    }
    this.startSong = this.startSong.bind(this)
    this.save = this.save.bind(this)
    this.chordRecorder = this.chordRecorder.bind(this)
    this.beatRecorder = this.beatRecorder.bind(this)
    this.lyricRecorder = this.lyricRecorder.bind(this)
    this.selectMode = this.selectMode.bind(this)
    this.beats = []
    this.chords = []
    this.lyrics = []
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
        }
        return newState
      }
      newState.measure = prevState.measure + (prevState.beat === 4 ? 1 : 0)
      newState.beat = prevState.beat % 4 + 1
      return newState
    })
  }

  startSong () {
    setTimeout(() => {
      const player = document.getElementsByTagName('audio')[0]
      this.player = player
      player.currentTime = 0
      player.play()
    }, 500)
  }

  beatRecorder () {
    this.setState((prevState, props) => {
      return {beats: prevState.beats.concat({time: this.player.currentTime})}
    })
  }

  chordRecorder (chord) {
    this.setState((prevState, props) => {
      return {chords: prevState.chords.concat({time: this.player.currentTime, chord})}
    })
  }

  lyricRecorder (lyric) {
    this.setState((prevState, props) => {
      return {lyrics: prevState.lyrics.concat({time: this.player.currentTime, lyric})}
    })
  }

  save () {
    $.post(`/song/${this.props.song.id}`, {data: JSON.stringify({
      beats: this.state.beats,
      chords: this.state.chords,
      lyrics: this.state.lyrics})})
  }

  selectMode (e) {
    this.setState({mode: e.target.value})
    const song = this.props.song.data
    if (e.target.value === 'record') {
      this.setState({beats: [], chords: [], lyrics: []})
    } else if (e.target.value === 'play') {
      this.setState({beats: song.beats, chords: song.chords, lyrics: song.lyrics})
    }
  }

  render () {
    const song = {
      data: {
        beats: this.state.beats,
        chords: this.state.chords,
        lyrics: this.state.lyrics
      }
    }

    const songControls = <div id="song">
          <h2>{this.props.song.title} - {this.props.song.original_artist}</h2>
          <input onChange={this.selectMode} type='radio' name='mode' value='record' />
          <label htmlFor="record">Record</label>
          <input type='radio' name='mode' value='play' onChange={this.selectMode}/>
          <label htmlFor="play">Play</label>
          <div style={{clear: 'both'}}></div>
          <audio style={{float: 'left'}} controls src={this.props.song.file} />
          <div style={{clear: 'both'}}></div>
        </div>

    if (this.state.mode === 'record') {
      return (
        <div>
          <div id="header">
            {songControls}
            <div className='recorderControls'>
              <button style={{float: 'left'}} onMouseDown={this.startSong} id="startSong">Record Song</button>
              <button style={{float: 'left'}} onClick={this.save}>Save</button>
              <div style={{clear: 'both'}}></div>
              <BeatRecorder beatRecorder={this.beatRecorder}/>
              <ChordRecorder chordRecorder={this.chordRecorder}/>
              <LyricRecorder lyricRecorder={this.lyricRecorder}/>
            </div>
          </div>
          <div style={{clear: 'both'}} />
          <SongScroller measure={this.state.measure}
            beat={this.state.beat}
            song={song}
          />
        </div>
      )
    } else if (this.state.mode === 'play' || !this.state.mode) {
      return <div>
        <div id="header">
          {songControls}
          <button onMouseDown={this.onBeat}>Triangle</button>
          <div style={{clear: 'both'}} />
        </div>
        <SongScroller measure={this.state.measure}
          beat={this.state.beat}
          song={song}
        />
      </div>
    } else {
      return <h3>Select mode</h3>
    }
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
      <div style={{float: 'left', width: 100}}>
        <h3>Beats</h3>
        <input type="button" value="beat" onMouseDown={this.props.beatRecorder}/>
      </div>
    )
  }

  onBeat () {
    console.log('does this happen?')
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
      let chords = document.getElementById('chord').value.split(' ')
      document.getElementById('chord').value = ''
      return {chords: (prevState.chords || []).concat(chords)}
    })
  }

  render () {
    let chordAdder = (
      <div>
        <h3>Chords</h3>
        <input id="chord" type="text" />
        <button onMouseDown={this.addChord}>Add chord(s)</button>
      </div>
    )

    let chordButtons = this.state.chords.map((chord) => {
      return <button onMouseDown={() => { this.props.chordRecorder(chord) }}
        style={{margin: 20}} key={Math.random()}>{chord}</button>
    })
    let chordSetter = (
      <div>
        {chordButtons}
      </div>
    )
    return (
      <div style={{float: 'left', width: 800}}>
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
      <div style={{float: 'left', width: 400}}>
        <h3>Lyrics</h3>
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
        <div style={{float: 'left', width: 400}}>
          <h3>Lyrics</h3>
          {buttons}
        </div>
      )
    }
  }
}

class SongChooser extends Component {
  constructor () {
    super()
    this.state = {songs: []}
    this.onSelect = this.onSelect.bind(this)
    this.fetchSongs()
  }

  fetchSongs () {
    $.getJSON('/songs').done((result) => {
      this.setState({songs: result})
    })
  }

  onSelect (e) {
    if (e.target.value) {
      const id = parseInt(e.target.value, 10)
      this.setState({chosenSong: this.state.songs.find((s) => s.id === id)})
    }
  }

  render () {
    const options = this.state.songs.map((song) => {
      return <option key={song.id} value={song.id}>{song.title} - {song.original_artist}</option>
    })
    options.unshift(<option key='pickasong' value={null}>Pick a song</option>)
    if (this.state.chosenSong) {
      const song = this.state.chosenSong
      return <Song song={song} />
    } else {
      return <select onSelect={this.onSelect} onChange={this.onSelect}>{options}</select>
    }
  }
}

class App extends Component {
  render () {
    return (
      <div>
        <SongChooser />
      </div>
    )
  }
}

export default App
