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
      <div id="songscroller">
        <Measure bar={1}>
          <Chord beat={1} name="E Minor" />
          <Chord beat={3} name="D Major" />
        </Measure>
        <Measure bar={2}>
          <Chord beat={1} name="G Major" />
          <Lyric beat={4} words="Well I" />
        </Measure>
        <Measure>
          <Chord beat={1} name="E Minor" />
          <Chord beat={3} name="D Major" />
          <Lyric beat={2} words="won't" />
          <Lyric beat={4} words="back" />
        </Measure>
      </div>
    )
  }
}

class Chord extends Component {
  render () {
    return <span className="chord">{this.props.name}</span>
  }
}

class Lyric extends Component {
  render () {
    return <span>{this.props.words}</span>
  }
}

class Measure extends Component {
  render () {
    console.log(this.props.children)
    return (
      <span className="measure">
        <div>
          {this.props.children.filter((child) => child.type === Chord)}
        </div>
        <div>
          {this.props.children.filter((child) => child.type === Lyric)}
        </div>
      </span>
    )
  }
}

class Metronome extends Component {
  render () {
    return (
      <div>
        <audio controls id='metronome'>
          <source src="/metronome.wav" />
        </audio>
      </div>
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

  componentWillUnmount () {
    clearInterval(this.beatUpdateInterval)
  }

  onPlay () {
    // TODO handle starts other than the start of song
    const startTime = Date.now()
    const playedBeats = {}
    this.beatUpdateInterval = setInterval(() => {
      const elapsedMS = Date.now() - startTime
      const elapsedBeats = Math.floor(elapsedMS / this.beatLength)
      // TODO account for non-standard time signatures
      const loc = {'measure': Math.floor(elapsedBeats / 4) + 1, 'beat': elapsedBeats % 4 + 1}
      if (!playedBeats[`${loc.measure}:${loc.beat}`]) {
        this.setState(loc)
        const audioElement = document.getElementById('metronome')
        audioElement.currentTime = 0
        audioElement.play()
        playedBeats[`${loc.measure}:${loc.beat}`] = true
      }
    }, 20)
  }

  render () {
    return (
      <div id="song">
        <TimeBar title={this.props.title}
                 artist={this.props.artist}
                 bars={this.props.bars}
                 onPlay={this.onPlay}
                 measure={this.state.measure}
                 beat={this.state.beat} />
        <Metronome />
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
      <Song title="I won't back down"
        artist="Tom Petty & the Heartbreakers"
        bars="140"
        bpm={100} />
    )
  }
}

export default App
