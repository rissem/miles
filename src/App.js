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
