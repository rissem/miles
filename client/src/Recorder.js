import React, { Component } from 'react'
import Scroller from './Scroller'
import $ from 'jquery'
import utils from './utils'
import _ from 'underscore'

class Recorder extends Component {
  constructor (props) {
    super(props)
    this.state = {
      beats: [],
      chords: [],
      lyrics: [],
      playerTime: 0
    }
    this.save = this.save.bind(this)
    this.startSong = this.startSong.bind(this)
    this.chordRecorder = this.chordRecorder.bind(this)
    this.beatRecorder = this.beatRecorder.bind(this)
    this.lyricRecorder = this.lyricRecorder.bind(this)
    this.chordClick = this.chordClick.bind(this)
  }

  componentDidMount () {
    this.fetchSong()
    $('body').on('keydown', (e) => {
      if (e.keyCode === 32) {
        this.player.paused ? this.player.play() : this.player.pause()
      }

      if (e.keyCode === 37) {
        this.backMeasure()
        e.preventDefault()
      } else if (e.keyCode === 39) {
        this.forwardMeasure()
        e.preventDefault()
      }
      // TODO also handle numpad for chords
    })
    this.playerTimeInterval = setInterval(() => {
      this.setState({update: Date.now()})
    }, 200) // force render
  }

  componentWillUnmount () {
    $('body').unbind('keydown')
    clearInterval(this.playerTimeInterval)
  }

  forwardMeasure () {
    let frontIndex = this.state.beats.findIndex((b) => b.time > this.player.currentTime)
    this.player.currentTime = this.state.beats[frontIndex + 3].time
  }

  backMeasure () {
    let frontIndex = this.state.beats.findIndex((b) => b.time > this.player.currentTime)
    let newIndex = frontIndex >= 4 ? frontIndex - 4 : 0
    this.player.currentTime = this.state.beats[newIndex].time
  }

  fetchSong () {
    if (this.fetchSongId === this.props.songId) return
    $.getJSON(`/song/${this.props.songId}`).done((result) => {
      this.setState({
        'song': result,
        'chords': result.data ? result.data.chords : [],
        'beats': result.data ? result.data.beats : [],
        'lyrics': result.data ? result.data.lyrics : []
      })
    })
    this.fetchSongId = this.props.songId
  }

  startSong () {
    setTimeout(() => {
      this.player = $('#audioPlayer')[0]
      this.player.currentTime = 0
      this.player.play()
    }, 500)
  }

  beatRecorder () {
    this.setState((prevState, props) => {
      return {beats: prevState.beats.concat({time: this.player.currentTime})}
    })
  }

  chordRecorder (chord) {
    console.log('record chord', chord)
    this.setState((prevState, props) => {
      return {chords: prevState.chords.concat({time: this.player.currentTime, chord}).sort((a, b) => a.time > b.time ? 1 : -1)}
    })
  }

  lyricRecorder (word) {
    this.setState((prevState, props) => {
      return {lyrics: prevState.lyrics.concat(
        {time: this.player.currentTime, lyric: word.lyric, startOfLine: word.startOfLine})
        .sort((a, b) => a.time > b.time ? 1 : -1)}
    })
  }

  chordClick (chord) {
    let beat = chord.beat
    this.setState((prevState, props) => {
      let beats = prevState.beats
      return {chords: prevState.chords.filter((c2) => {
        return !(c2.time > (beats[beat - 1].time + beats[beat - 2].time) / 2 &&
        c2.time < (beats[beat - 1].time + beats[beat].time) / 2)
      })}
    })
  }

  save () {
    $.post(`/song/${this.props.songId}`, {data: JSON.stringify({
      beats: this.state.beats,
      chords: this.state.chords,
      lyrics: this.state.lyrics})})
  }

  render () {
    this.fetchSong()
    this.player = document.getElementById('audioPlayer')
    if (!this.state.song) {
      return <h2>Loading...</h2>
    }
    const song = utils.quantizeSong({
      beats: this.state.beats,
      chords: this.state.chords,
      lyrics: this.state.lyrics
    })
    let beat = null
    const beats = this.state.beats
    if (this.state.beats.length >= 2 && this.player) {
      const beatLength = (this.state.beats[this.state.beats.length - 1].time - this.state.beats[0].time) / (this.state.beats.length - 1) * 1000
      const firstBeat = this.state.beats[0].time
      const lastBeat = this.state.beats[this.state.beats.length - 1].time
      if (this.player.currentTime < firstBeat) {
        beat = null
      } else if (this.player.currentTime >= lastBeat) {
        beat = this.state.beats.length + (this.player.currentTime - lastBeat) / (beatLength / 1000)
      } else {
        let frontIndex = beats.findIndex((b) => b.time > this.player.currentTime)
        let backIndex = frontIndex - 1
        beat = backIndex + (this.player.currentTime - this.state.beats[backIndex].time) /
          (this.state.beats[frontIndex].time - this.state.beats[backIndex].time) + 1
      }
    }
    // separately handle case where beat is ahead of

    return (
      <div>
        <div id="header">
          <div id="song">
            <h2>Record {this.state.song.title} - {this.state.song.original_artist}</h2>
            <audio id="audioPlayer" style={{float: 'left'}} controls src={this.state.song.file} />
            <div style={{clear: 'both'}}></div>
          </div>
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
        <div>Navigate with left/right arrow keys</div>
        <Scroller measure={this.state.measure}
          beat={beat}
          beatTime={Date.now()}
          beatLength={beats.length >= 4 ? (beats[beats.length - 1].time - beats[0].time) / beats.length * 1000 : 600}
          song={song}
          chordClick={this.chordClick}
        />
      </div>
    )
  }
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

  componentDidMount () {
    $('body').on('keydown', (e) => {
      if (e.keyCode >= 49 && e.keyCode <= 57) {
        this.props.chordRecorder(this.state.chords[e.keyCode - 49])
      }
    })
  }
  // HACK unbinding handled by parent

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

    let chordNum = 1
    let chordButtons = this.state.chords.map((chord) => {
      return <button onMouseDown={() => { this.props.chordRecorder(chord) }}
        style={{margin: 20}} key={Math.random()}>{chord} ({chordNum++})</button>
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
    const words = text.split(/\n+/).map((line)=> line.split(/\s+/))
    .map(([firstElement, ...rest])=>{
      return [
        {lyric: firstElement, startOfLine: true},
        ...rest.map((element)=> {return {lyric: element, startOfLine: false}})
      ]
    })
    this.setState({lyrics: _.flatten(words)})
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
      // this seems like a bad way to handle keys
      let i = 0
      const buttons = this.state.lyrics.map((lyric) => {
        i += 1
        return <button onMouseDown={this.addLyric} key={lyric + i}>{lyric.lyric}</button>
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

export default Recorder
