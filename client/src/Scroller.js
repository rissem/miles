import React, { Component } from 'react'
import $ from 'jquery'
const audioCtx = window.audioCtx = window.audioCtx || new (window.AudioContext || window.webkitAudioContext)();


// section of code up here that knows nothing about music
// something like draw(shape, text, color, border, shape, position)

const minimumBeatContainerWidth = 150
const rowHeight = 200
const beatContainerHeight = rowHeight

const beatHeight = 12
const beatWidth = 35
const beatStrokeWidth = 4
const chordWidthCorrection = 10
const chordHeightCorrection = 40
const chordFontSizeString = '40'

const lyricFontSizeString = '30'
const lyricWidthCorrection = 0
const lyricHeightCorrection = -15

const backgroundColor = "#222"

const currentBeatColor = "#aaa"
const pastBeatColor = "#444"
const inactiveBeatColor = "#666"
const beatOutlineColor = "#ccc"
const cursorColor = "#FF0"

const upcomingLyricColor = "#fff"
const pastLyricColor = currentBeatColor

const debugBeatContainerOutlineColor = "#444"

class Scroller extends Component {
  constructor (props) {
    super(props)
    this.clickable = {}
    this.state = {
      drawDebug: false,
      logDebug: false,
      offset: 0
    }
  }

  beatOffset () {
    return this.state.offset
  }

  beatsPerLine () {
    return Math.floor(Math.floor(this.state.width / minimumBeatContainerWidth) / 4) * 4
  }

  beatContainerWidth () {
    // return minimumBeatContainerWidth
    return Math.floor(this.state.width / (this.beatsPerLine() + 1))
  }

  beatContainerToCoordinate (beat) {
    const beatsPerLine = this.beatsPerLine()
    const activeRow = Math.floor((this.state.displayBeat - 1) / beatsPerLine) + 1
    const beatRow = Math.floor((this.beatOffset() + beat - 1) / beatsPerLine) + 1
    // beat row is the second row

    const x = ((this.beatOffset() + beat - 1) % beatsPerLine) * this.beatContainerWidth()
    const lineComplete = ((this.state.displayBeat - 1) % beatsPerLine) / beatsPerLine
    const y = (beatRow + 1 - activeRow) * rowHeight - rowHeight * lineComplete
    return {x, y}
  }

  beatToCoordinate (beat) {
    const beatsPerLine = this.beatsPerLine()
    const activeRow = Math.floor((this.beatOffset() + this.state.displayBeat - 1) / beatsPerLine) + 1
    const beatRow = Math.floor((this.beatOffset() + beat - 1) / beatsPerLine) + 1

    const x = ((this.beatOffset() + beat - 1) % beatsPerLine) * this.beatContainerWidth() + (beatWidth / 2)
    const lineComplete = ((this.beatOffset() + this.state.displayBeat - 1) % beatsPerLine) / beatsPerLine
    const y = (beatRow + 1 - activeRow) * rowHeight - rowHeight * lineComplete + (rowHeight / 2)
    return {x, y}
  }

  beatToChordCoordinate (beat) {
    const beatsPerLine = this.beatsPerLine()
    const activeRow = Math.floor((this.beatOffset() + this.state.displayBeat - 1) / beatsPerLine) + 1
    const beatRow = Math.floor((this.beatOffset() + beat - 1) / beatsPerLine) + 1

    const x = ((this.beatOffset() + beat - 1) % beatsPerLine) * this.beatContainerWidth() + chordWidthCorrection
    const lineComplete = ((this.beatOffset() + this.state.displayBeat - 1) % beatsPerLine) / beatsPerLine
    const y = (beatRow + 1 - activeRow) * rowHeight - rowHeight * lineComplete + chordHeightCorrection
    return {x, y}
  }

  beatToLyricCoordinate (beat) {
    const beatsPerLine = this.beatsPerLine()
    const activeRow = Math.floor((this.beatOffset() + this.state.displayBeat - 1) / beatsPerLine) + 1
    const beatRow = Math.floor((this.beatOffset() + beat - 1) / beatsPerLine) + 1

    const x = ((this.beatOffset() + beat - 1) % beatsPerLine) * this.beatContainerWidth() + (beatWidth / 2) + lyricWidthCorrection
    const lineComplete = ((this.beatOffset() + this.state.displayBeat - 1) % beatsPerLine) / beatsPerLine
    const y = (beatRow + 1 - activeRow) * rowHeight - rowHeight * lineComplete + (rowHeight / 2) + lyricHeightCorrection
    return {x, y}
  }

  drawBeatContainer (beat) {
    this.ctx.strokeStyle = debugBeatContainerOutlineColor
    const {x, y} = this.beatContainerToCoordinate(beat)
    this.ctx.strokeRect(x, y, this.beatContainerWidth(), beatContainerHeight)

    this.resetFill()
  }

  drawBeat (beat, current, fillStyle) {
    if (this.state.drawDebug) {
      this.drawBeatContainer(beat)
    }
    if (fillStyle !== undefined) {
      this.ctx.fillStyle = fillStyle
    } else if (current > beat) {
      this.ctx.fillStyle = pastBeatColor
    } else if (current === beat) {
      this.ctx.fillStyle = currentBeatColor
    } else {
      this.ctx.fillStyle = inactiveBeatColor
    }
    this.ctx.strokeStyle = beatOutlineColor
    const {x, y} = this.beatToCoordinate(beat)
    // this.ctx.fillRect(x, y, beatHeight, beatWidth)

    this.ctx.beginPath()
    this.ctx.arc(x, y, beatHeight, 0, 2 * Math.PI, false)

    this.ctx.lineWidth = beatStrokeWidth
    this.ctx.strokeStyle = beatOutlineColor
    this.ctx.stroke()
    this.ctx.fill()
    this.ctx.closePath()
    //this.ctx.fillText(beat, x, y)
    // this.resetFill()
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
    this.ctx.beginPath()
    this.ctx.rect(0, 0, this.state.width, this.state.height)
    this.ctx.fillStyle = backgroundColor
    this.ctx.fill()
  }

  drawBeats () {
    const [firstBeat, lastBeat] = this.visibleBeats()
    for (let i = firstBeat; i <= lastBeat; i++) {
      this.drawBeat(i, Math.floor(this.state.displayBeat))
    }
    this.setState({firstBeat, lastBeat})
  }

  drawChords () {
    this.handlers = []
    if (!this.props.song || !this.props.song.chords) return
    const [firstBeat, lastBeat] = this.visibleBeats()
    this.props.song.chords.forEach((chord) => {
      if (chord.beat >= firstBeat && chord.beat < lastBeat) {
        const {x, y} = this.beatToChordCoordinate(chord.beat)
        this.ctx.fillStyle = 'white'
        this.ctx.fontStyle = 'extra-strong'
        this.ctx.font = chordFontSizeString + 'px Helvetica'
        const measurement = this.ctx.measureText(chord.chord)
        const height = parseInt(chordFontSizeString, 10)
        this.handlers.push({chord, x, y, width: measurement.width, height})
        // this.ctx.fillRect(x, y, measurement.width, -1 * parseInt(chordFontSizeString))
        // this.ctx.fillText(chord.chord + " " + chord.time, x, y)
        this.ctx.fillText(chord.chord, x, y)
        if (this.state.logDebug) {
          console.log("drawing chord:", chord)
        }
      }
    })
  }

  drawLyrics () {
    if (!this.props.song || !this.props.song.lyrics) return
    const [firstBeat, lastBeat] = this.visibleBeats()
    this.props.song.lyrics.forEach((lyric) => {
      if (lyric.beat > firstBeat && lyric.beat < lastBeat) {
        const passed = lyric.beat < this.state.displayBeat
        const {x, y} = this.beatToLyricCoordinate(lyric.beat)
        this.ctx.fillStyle = passed ? pastLyricColor : upcomingLyricColor
        this.ctx.font = lyricFontSizeString + 'px Helvetica'
        this.ctx.fillText(lyric.lyric, x, y + 100)
        if (this.state.logDebug) {
          console.log("drawing lyric:", lyric.lyric)
        }
      }
    })
  }

  drawCursor () {
    this.drawBeat(this.state.displayBeat, null, cursorColor)
  }

  updateBeats (lastDraw) {
    if (this.props.beat < 1) {
      this.setState({displayBeat: 1})
      return
    }
    const now = audioCtx.currentTime
    const idealBeat = this.props.beat + (now - this.props.beatTime) / this.props.beatLength
    let lastDisplayBeat = this.state.displayBeat || this.props.beat
    const delta = idealBeat - lastDisplayBeat
    const catchup = delta * (now - lastDraw) / this.props.beatLength
    var displayBeat = lastDisplayBeat + (now - lastDraw) / this.props.beatLength + catchup
    this.setState({idealBeat, displayBeat})
  }

  draw (lastDraw) {
    if (this.unmounted) return
    this.resize()
    this.updateBeats(lastDraw)
    this.beat = this.props.beat + (audioCtx.currentTime - this.props.lastBeat)
    if (audioCtx.currentTime - this.lastDraw > 50) console.log('SLOW FRAME', audioCtx.currentTime - this.lastDraw)
    this.ctx.clearRect(0, 0, this.state.width, this.state.height)

    // this.beatMeta = this.calculateBeatMeta(this.beat)

    this.drawBackground()
    this.drawBeats()
    this.drawLyrics()
    this.drawChords()
    this.drawCursor()
    window.requestAnimationFrame(() => this.draw(this.lastDraw))
    this.lastDraw = audioCtx.currentTime
  }

  resetFill () {
    this.ctx.fillStyle = backgroundColor
  }

  resize() {
    const height = window.innerHeight - $('#canvas').position().top - 20
    const width = window.innerWidth - 20
    if (this.state.height === height && this.state.width === width) {
      return
    }
    if (this.state.logDebug) {
      console.log("h: ", height)
      console.log("w: ", width)
    }
    this.setState({height, width})
  }

  componentDidMount () {
    // TODO handle resize events
    // TODO figure out how to get it to be exactly 100%, scrap the "- 20"

    this.ctx = document.getElementById('canvas').getContext('2d')
    this.resize()
    window.requestAnimationFrame(() => this.draw())

    $('canvas').mousedown((e) => {
      this.mouseDown = {x: e.clientX, y: e.clientY}
    })

    $('canvas').mouseup((e) => {
      if (e.clientX === this.mouseDown.x && e.clientY === this.mouseDown.y) {
        this.handlers.forEach((handler) => {
          if (e.offsetX > handler.x && e.offsetX < handler.x + handler.width &&
            e.offsetY < handler.y && e.offsetY > handler.y - handler.height
          ) {
            if (this.props.chordClick) {
              this.props.chordClick(handler.chord)
            }
          }
        })
      }
    })
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
