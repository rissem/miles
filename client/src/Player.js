import React, { Component } from 'react'
import $ from 'jquery'
import utils from './utils'
import Scroller from './Scroller'

class Player extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.triangle = this.triangle.bind(this)
  }

  componentDidMount () {
    this.fetchSong()
  }

  triangle () {
    this.setState((prevState, props) => {
      return {beat: ++prevState.beat, beatTime: Date.now()}
    })
  }

  fetchSong () {
    $.getJSON(`/song/${this.props.songId}`).done((result) => {
      this.setState({
        'rawSong': result,
        'beat': 0,
        // average time between first and tenth beats then convert from ms between beats to bpm
        'beatLength': (result.data.beats[10].time - result.data.beats[0].time) / 10 * 1000,
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
