import React, { Component } from 'react'
import Player from './Player'
import Recorder from './Recorder'
import $ from 'jquery'

class Chooser extends Component {
  constructor () {
    super()
    this.state = {songs: []}
    this.onSelect = this.onSelect.bind(this)
    this.selectMode = this.selectMode.bind(this)
    this.fetchSongs()
  }

  fetchSongs () {
    $.getJSON('/songs').done((result) => {
      this.setState({songs: result})
    })
  }

  onSelect (e) {
    if (e.target.value) {
      const id = parseInt(e.target.value, 10)
      $.post(`/selectSong/${id}`).done((result)=>{
        this.setState({chosenSong: this.state.songs.find((s) => s.id === id)})
      })
    }
  }

  selectMode (e) {
    this.setState({mode: e.target.value})
  }

  recordPlayToggle () {
    const song = this.state.chosenSong
    return (
      <div>
        <h2>{song.title} - {song.original_artist}</h2>
        <input onChange={this.selectMode} type='radio' name='mode' value='record' />
        <label htmlFor="record">Record</label>
        <input type='radio' name='mode' value='play' onChange={this.selectMode}/>
        <label htmlFor="play">Play</label>
        <div style={{clear: 'both'}}></div>
      </div>
    )
  }

  songSelector () {
    const options = this.state.songs.map((song) => {
      return <option key={song.id} value={song.id}>{song.title} - {song.original_artist}</option>
    })
    options.unshift(<option key='pickasong' value={null}>Pick a song</option>)
    return <select onSelect={this.onSelect} onChange={this.onSelect}>{options}</select>
  }

  render () {
    return (<div>
      {this.songSelector()}
      {(this.state.chosenSong) ? this.recordPlayToggle() : null }
      {this.state.mode === 'play' ? <Player songId={this.state.chosenSong.id} /> : null}
      {this.state.mode === 'record' ? <Recorder songId={this.state.chosenSong.id} /> : null}
    </div>)
  }
}

export default Chooser
