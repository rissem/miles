import React, { Component } from 'react'
import $ from 'jquery'
import utils from './utils'
import Scroller from './Scroller'
import bass from './synth/bass'
import drums from './synth/drums'

const audioCtx = window.audioCtx = window.audioCtx || new (window.AudioContext || window.webkitAudioContext)();

// setInterval(()=>{
//   drums.play('bassDrumAcoustic', 0)
//   //drums.play('hihat_closed', 0)
// //  drums.play('snare', 0)
//   bass.play('E', 0)
// }, 600)


class Player extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.triangle = this.triangle.bind(this)
  }

  componentDidMount () {
    this.fetchSong()
    this.onKeyDown = (e) => {
      if (e.keyCode === 32) this.triangle()
    }
    $(document.body).keydown(this.onKeyDown)
  }

  componentWillUnmount () {
    $('body').unbind('keydown')
  }

  triangle () {
    $.post(`/triangle`).done(()=>console.log("triangle done"))
    this.setState((prevState, props) => {
      let now = audioCtx.currentTime
      let newState = {}
      newState.beat = ++prevState.beat
      newState.beatTime = now
      newState.beats = prevState.beats.concat(now)
      if (newState.beats.length >= 5) {
        let lastBeat = newState.beats[newState.beats.length - 1]
        let fourBeatsAgo = newState.beats[newState.beats.length - 5]
        newState.beatLength = (lastBeat - fourBeatsAgo) / 4
      }
      return newState
    })
  }

  fetchSong () {
    $.getJSON(`/song/${this.props.songId}`).done((result) => {
      let lastBeat = result.data.beats.length > 10 ? 10 : result.data.beats.length - 1
      this.setState({
        'rawSong': result,
        'beat': 0,
        'beats': [],
        // average time between first and tenth beats then convert from ms between beats to bpm
        'beatLength': (result.data.beats[lastBeat].time - result.data.beats[0].time) / 10,
        'quantizedSong': utils.quantizeSong(result.data)
      })
      this.createArrangement()
      this.startAccompaniment()
    })
  }

  startAccompaniment() {
    const LOOP_TIME = 100
    const LOOK_AHEAD = 100

    let lastScheduledBeat = 0
    setInterval(()=>{
      let beat = this.state.beat
      beat -= 4
      const adjustment = (audioCtx.currentTime - this.state.beats[this.state.beats.length - 1]) /  this.state.beatLength
      beat += adjustment
      let beat2 = beat + (LOOP_TIME + LOOK_AHEAD) / (this.state.beatLength * 1000)
      if (beat > lastScheduledBeat){
        console.error("unscheduled beats", beat, lastScheduledBeat)
      }
      const events = this.arrangement.filter((event)=> event.beat > beat && event.beat > lastScheduledBeat && event.beat < beat2)
      lastScheduledBeat = beat2
      this.scheduleEvents(events)
    }, LOOP_TIME)
  }

  scheduleEvents(events) {
    const currentBeat = this.state.beat - 4 + (audioCtx.currentTime - this.state.beats[this.state.beats.length - 1]) /  this.state.beatLength
    const beatToTime = (beat)=>(beat - currentBeat) * this.state.beatLength
    events.forEach((event)=>{
      if (event.instrument === 'drums'){
        console.log('current time', audioCtx.currentTime)
        console.log('play drums', event.drum, beatToTime(event.beat))
        drums.play(event.drum, beatToTime(event.beat))
      }
      else if (event.instrument === 'bass'){
       bass.play(event.note, beatToTime(event.beat))
      }
    })
  }

  createArrangement() {
    const events = []
    for (let beat = 1; beat <= this.state.rawSong.data.beats.length; beat++){
      if (beat % 4 === 1 || beat % 4 === 3){
        events.push({beat, instrument: 'drums', drum: 'bassDrumAcoustic'})
      }
      // events.push({beat, instrument: 'drums', drum: 'hihat_closed'})
      // events.push({beat: beat + 0.5, instrument: drums, drum: 'hihat_closed'})
      if (beat % 4 === 2 || beat % 4 === 0){
        events.push({beat, instrument: 'drums', drum: 'snare'})
      }
    }

    const chordToNote = (chord)=> /([A-G])([#b])?.*/.exec(chord)[1]

    this.state.quantizedSong.chords.forEach((chord)=>{
      events.push({beat: chord.beat, instrument: 'bass', note: chordToNote(chord.chord)})
    })
    events.sort((x,y)=> x.beat > y.beat ? 1 : -1 )
    this.arrangement = events
  }

  render () {
    const beat = this.state.beat
    return <div>
      <audio controls src={this.state.rawSong && this.state.rawSong.file} />
      <button onClick={this.triangle}>Triangle</button>
      <div style={{clear: 'both'}}></div>
      <Scroller song={this.state.quantizedSong} beat={beat >= 5 ? beat - 4 : 0}
        beatLength={this.state.beatLength}
        beatTime={this.state.beatTime}
      />
    </div>
  }
}

export default Player
