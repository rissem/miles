import React, { Component } from 'react'
import $ from 'jquery'
import utils from './utils'
import Scroller from './Scroller'
import bass from './synth/bass'
import drums from './synth/drums'

// setInterval(()=>{
//   drums.play('bassDrumAcoustic', 0)
//   drums.play('hihat_closed', 0)
//   drums.play('snare', 0)
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
      let now = Date.now()
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
        'beatLength': (result.data.beats[lastBeat].time - result.data.beats[0].time) / 10 * 1000,
        'quantizedSong': utils.quantizeSong(result.data)
      })
    })
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
