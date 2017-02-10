import React, { Component } from 'react'
import $ from 'jquery'
import utils from './utils'

class Player extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    this.fetchSong()
  }

  fetchSong () {
    $.getJSON(`/song/${this.props.songId}`).done((result) => {
      this.setState({
        'rawSong': result,
        'quantizedSong': utils.quantizeSong(result.data)
      })
    })
  }

  render () {
    return <div>
      <audio controls src={this.state.rawSong && this.state.rawSong.file} />
    </div>
  }
}

export default Player
