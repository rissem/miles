import React, { Component } from 'react'
import $ from 'jquery'

// section of code up here that knows nothing about music
// something like draw(shape, text, color, border, shape, position)

const beatWidth = 150
const rowHeight = 200

let now = Date.now()
class Scroller extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  beatToCoordinate (beat) {
    const beatsPerLine = Math.floor(Math.floor(this.state.width / beatWidth) / 4) * 4
    const activeRow = Math.floor((this.state.displayBeat - 1) / beatsPerLine) + 1
    const beatRow = Math.floor((beat - 1) / beatsPerLine) + 2
    // beat row is the second row

    const x = ((beat - 1) % beatsPerLine) * beatWidth
    const lineComplete = ((this.state.displayBeat - 1) % beatsPerLine) / beatsPerLine
    const y = (beatRow + 1 - activeRow) * rowHeight - rowHeight * lineComplete
    return {x, y}
  }

  drawLyric (lyric) {
    console.log('draw lyric', lyric)
  }

  drawBeat (beat, current, fillStyle) {
    this.ctx.fillStyle = fillStyle || current ? 'green' : 'red'
    const {x, y} = this.beatToCoordinate(beat)
    this.ctx.fillRect(x, y + 30, 20, 20)
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
        const {x, y} = this.beatToCoordinate(chord.beat)
        this.ctx.fillStyle = 'black'
        this.ctx.fontStyle = 'extra-strong'
        this.ctx.font = '40px Helvetica'
        this.ctx.fillText(chord.chord, x, y)
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

    this.drawBeats()
    this.drawLyrics()
    this.drawChords()
    this.drawCursor()
    this.drawGuides()
    window.requestAnimationFrame(() => this.draw(this.lastDraw))
    this.lastDraw = Date.now()
  }

  componentDidMount () {
    // TODO handle resize events
    // TODO figure out how to get it to be exactly 100%, scrap the "- 20"
    const height = window.innerHeight - $('#canvas').position().top - 20
    const width = window.innerWidth - 20
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
