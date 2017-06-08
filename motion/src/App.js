import React, { Component } from 'react'
import './App.css'
import $ from 'jquery'

// for developer convenience in developer tools
window.$ = $

class App extends Component {
  constructor(props) {
    super(props)
    this.socket =
      //TODO figure out how make this a runtime option..
      new WebSocket(`ws://localhost:3000`)

    // Connection opened
    this.socket.addEventListener('open', (event)=> {
      this.socket.send(JSON.stringify({msg: "Hello Server"}))
    });

    // Listen for messages
    this.socket.addEventListener('message', (event)=> {
      console.log('Message from server', event.data);
    });
  }

  render () {
    return (
      <h1>Hello World</h1>
    )
  }
}

export default App
