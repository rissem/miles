import React, { Component } from 'react'
import $ from 'jquery'

// section of code up here that knows nothing about music
// something like draw(shape, text, color, border, shape, position)

const beatContainerWidth = 150
const rowHeight = 150
const beatContainerHeight = rowHeight

const beatHeight = 35
const beatWidth = 35
const chordWidthCorrection = 12
const chordHeightCorrection = 12
const chordFontSizeString = '40'

const backgroundColor = "#222"

const currentBeatColor = "#ffcc00"
const inactiveBeatColor = backgroundColor //"#00ccaa"
const beatOutlineColor = "#ccc"


const debugBeatContainerOutlineColor = "#444"

let now = Date.now()
class Scroller extends Component {
  constructor (props) {
    super(props)
    this.state = {
      drawDebug: true
    }
  }

  beatContainerToCoordinate (beat) {
    const beatsPerLine = Math.floor(Math.floor(this.state.width / beatContainerWidth) / 4) * 4
    const activeRow = Math.floor((this.state.displayBeat - 1) / beatsPerLine) + 1
    const beatRow = Math.floor((beat - 1) / beatsPerLine) + 1
    // beat row is the second row

    const x = ((beat - 1) % beatsPerLine) * beatContainerWidth 
    const lineComplete = ((this.state.displayBeat - 1) % beatsPerLine) / beatsPerLine
    const y = (beatRow + 1 - activeRow) * rowHeight - rowHeight * lineComplete 
    return {x, y}
  }

  beatToCoordinate (beat) {
    const beatsPerLine = Math.floor(Math.floor(this.state.width / beatContainerWidth) / 4) * 4
    const activeRow = Math.floor((this.state.displayBeat - 1) / beatsPerLine) + 1
    const beatRow = Math.floor((beat - 1) / beatsPerLine) + 1
    // beat row is the second row

    const x = ((beat - 1) % beatsPerLine) * beatContainerWidth + (beatContainerWidth / 2) // - (beatWidth / 2))
    const lineComplete = ((this.state.displayBeat - 1) % beatsPerLine) / beatsPerLine
    const y = (beatRow + 1 - activeRow) * rowHeight - rowHeight * lineComplete + (rowHeight / 2) // - (beatHeight / 2))
    return {x, y}
  }

  beatToChordCoordinate (beat) {
    const beatsPerLine = Math.floor(Math.floor(this.state.width / beatContainerWidth) / 4) * 4
    const activeRow = Math.floor((this.state.displayBeat - 1) / beatsPerLine) + 1
    const beatRow = Math.floor((beat - 1) / beatsPerLine) + 2
    // beat row is the second row

    const x = ((beat - 1) % beatsPerLine) * beatContainerWidth + ((beatContainerWidth / 2) - chordWidthCorrection )
    const lineComplete = ((this.state.displayBeat - 1) % beatsPerLine) / beatsPerLine
    const y = (beatRow + 1 - activeRow) * rowHeight - rowHeight * lineComplete + ((rowHeight / 2)  + chordHeightCorrection)
    return {x, y}
  }

  drawLyric (lyric) {
    console.log('draw lyric', lyric)
  }

  drawBeatContainer (beat) {
    this.ctx.strokeStyle = debugBeatContainerOutlineColor
    const {x, y} = this.beatContainerToCoordinate(beat)
    this.ctx.strokeRect(x, y, beatContainerHeight, beatContainerWidth)

    this.resetFill()
  }

  drawBeat (beat, current, fillStyle) {
    if (this.state.drawDebug) {
      this.drawBeatContainer(beat)
    }
    this.ctx.fillStyle = fillStyle || current ? currentBeatColor : inactiveBeatColor
    this.ctx.strokeStyle = beatOutlineColor
    const {x, y} = this.beatToCoordinate(beat)
    //this.ctx.fillRect(x, y, beatHeight, beatWidth)
    
    this.ctx.beginPath()
    this.ctx.arc(x, y, beatHeight, 0, 2 * Math.PI, false)

    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = beatOutlineColor;
    this.ctx.stroke();
    this.ctx.fill()
    this.ctx.closePath()
    //this.resetFill()
  }

  visibleBeats () {
    const beatsPerLine = Math.floor(Math.floor(this.state.width / beatWidth) / 4) * 4
    const line = Math.floor((this.state.displayBeat - 1) / beatsPerLine) + 1
    // when we're singing the second line, first line should be visible
    const firstBeat = line === 1 ? 1 : (line - 2) * beatsPerLine + 1
    const rowCount = Math.floor(this.state.height / rowHeight)
    const lastBeat = firstBeat + (beatsPerLine) * (rowCount + 2)
    return [firstBeat, lastBeat]
  }

  drawBackground () {
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.state.width, this.state.height);
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fill();
  }

  drawBeats () {
    const [firstBeat, lastBeat] = this.visibleBeats()
    for (let i = firstBeat; i <= lastBeat; i++) {
      this.drawBeat(i, Math.floor(this.state.displayBeat) === i)
    }
    this.setState({firstBeat, lastBeat})
  }

  drawChords () {
    if (!this.props.song || !this.props.song.chords) return
    const [firstBeat, lastBeat] = this.visibleBeats()
    this.props.song.chords.forEach((chord) => {
      if (chord.beat > firstBeat && chord.beat < lastBeat) {
        const {x, y} = this.beatToChordCoordinate(chord.beat)
        this.ctx.fillStyle = 'white'
        this.ctx.fontStyle = 'extra-strong'
        this.ctx.font = chordFontSizeString + 'px Helvetica'
        this.ctx.fillText(chord.chord, x, y)
        if (this.state.drawDebug) {
          console.log("drawing chord:", chord.chord)
        }
      }
    })
  }
  drawGuides () {}

  drawLyrics () {
    if (!this.props.song || !this.props.song.lyrics) return
    const [firstBeat, lastBeat] = this.visibleBeats()
    this.props.song.lyrics.forEach((lyric) => {
      if (lyric.beat > firstBeat && lyric.beat < lastBeat) {
        const passed = lyric.beat < this.state.displayBeat
        const {x, y} = this.beatToCoordinate(lyric.beat)
        this.ctx.fillStyle = passed ? 'red' : 'black'
        this.ctx.font = '30px Times New Roman'
        this.ctx.fillText(lyric.lyric, x, y + 100)
        if (this.state.drawDebug) {
          console.log("drawing lyric:", lyric.lyric)
        }
      }
    })
  }

  drawCursor () {
    this.drawBeat(this.state.displayBeat, null, 'rgba(0, 100, 100, 0.4)')
  }

  updateBeats (lastDraw) {
    if (this.props.beat < 1) {
      this.setState({displayBeat: 1})
      return
    }
    const now = Date.now()
    const idealBeat = this.props.beat + (now - this.props.beatTime) / this.props.beatLength
    let displayBeat = this.state.displayBeat || this.props.beat
    const delta = idealBeat - displayBeat
    const catchup = delta * (now - lastDraw) / this.props.beatLength
    displayBeat += (now - lastDraw) / this.props.beatLength + catchup
    this.setState({idealBeat, displayBeat})
  }

  draw (lastDraw) {
    now = Date.now()
    if (this.unmounted) return
    this.updateBeats(lastDraw)
    this.beat = this.props.beat + (Date.now() - this.props.lastBeat)
    if (Date.now() - now > 50) console.log('SLOW FRAME', Date.now() - now)
    this.ctx.clearRect(0, 0, this.state.width, this.state.height)

    this.drawBackground()
    this.drawBeats()
    this.drawLyrics()
    this.drawChords()
    this.drawCursor()
    this.drawGuides()
    window.requestAnimationFrame(() => this.draw(this.lastDraw))
    this.lastDraw = Date.now()
  }

  resetFill () {
    this.ctx.fillStyle = backgroundColor;
  }

  componentDidMount () {
    // TODO handle resize events
    // TODO figure out how to get it to be exactly 100%, scrap the "- 20"
    const height = window.innerHeight - $('#canvas').position().top - 20
    const width = window.innerWidth - 20
    if (this.state.drawDebug) {
      console.log("h: ", height)
      console.log("w: ", width)
    }
    this.ctx = document.getElementById('canvas').getContext('2d')
    this.setState({height, width})
    window.requestAnimationFrame(() => this.draw())
  }

  componentWillUnmount () {
    this.unmounted = true
  }

  render () {
    return (
      <canvas width={this.state.width} height={this.state.height} id='canvas'/>
    )
  }
}
export default Scroller
