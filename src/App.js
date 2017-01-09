import React, { Component } from 'react'
import './App.css'

class TimeBar extends Component {
  render () {
    return (
      <div id="timeBar">
        <h3>{this.props.title} - {this.props.artist}</h3>
        <button onClick={this.props.onPlay}>Play</button>
        <div>{this.props.measure}</div>
        <div>{this.props.beat}</div>
      </div>
    )
  }
}

class SongScroller extends Component {
  render () {
    return (
      <h1>Song Scroller</h1>
    )
  }
}

class Song extends Component {
  constructor (props) {
    super(props)
    this.beatLength = 1 / (props.bpm / 60 / 1000)
    console.log('beat length', this.beatLength)
    this.onPlay = this.onPlay.bind(this)
    this.state = {
      measure: 1,
      beat: 1
    }
  }

  componentDidUnmount () {
    clearInterval(this.beatUpdateInterval)
  }

  onPlay () {
    // TODO handle starts other than the start of song
    const startTime = Date.now()
    this.beatUpdateInterval = setInterval(() => {
      const elapsedMS = Date.now() - startTime
      const elapsedBeats = Math.floor(elapsedMS / this.beatLength)
      // TODO account for non-standard time signatures
      this.setState({'measure': Math.floor(elapsedBeats / 4) + 1, 'beat': elapsedBeats % 4 + 1})
    }, 20)
  }

  render (props) {
    return (
      <div id="song">
        <TimeBar title={this.props.title}
                 artist={this.props.artist}
                 bars={this.props.bars}
                 onPlay={this.onPlay}
                 measure={this.state.measure}
                 beat={this.state.beat} />
        <SongScroller />
      </div>
    )
  }
}

Song.propTypes = {
  bpm: React.PropTypes.number
}

class App extends Component {
  render () {
    return (
      <Song title="I won't back down" artist="Tom Petty" bars="140" bpm={100} />
    )
  }
}

export default App
