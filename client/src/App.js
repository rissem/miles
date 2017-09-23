import React, { Component } from 'react'
import './App.css'
import $ from 'jquery'
import Chooser from './Chooser'
import './router'

// for developer convenience
window.$ = $


class App extends Component {
  constructor(props) {
    super(props)
    this.socket =
      new WebSocket(`ws://${document.location.host}`)

    // Connection opened
    this.socket.addEventListener('open', (event)=> {
      this.socket.send(JSON.stringify({msg: "Hello Server"}))
    });

    // Listen for messages
    this.socket.addEventListener('message', (event)=> {
      // console.log('Message from server', event.data);
    });
  }

  render () {
    return (
      <div id="fullscreen-container">
        <Chooser />
      </div>
    )
  }
}

export default App
