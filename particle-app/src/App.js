import React, { Component } from 'react'
import './App.css'
import $ from 'jquery'
import CSSTransitionGroup from 'react-addons-css-transition-group'
// for developer convenience in developer tools
window.$ = $

class App extends Component {
  constructor(props) {
    super(props)
    /*
    const script = document.createElement("script");
    script.src = "./js/three.min.js";
    script.async = true;
    document.body.appendChild(script);
    const script1 = document.createElement("script");
    script.src = "./js/GPUParticleSystem.js";
    script.async = true;
    document.body.appendChild(script1);
    */
    this.socket =
      //TODO figure out how make this a runtime option..
      new WebSocket(`ws://localhost:3000`)

    // Connection opened
    this.socket.addEventListener('open', (event)=> {
      this.socket.send(JSON.stringify({msg: "Miles"}))
      this.content = (<div>Miles KTV</div>)
      this.beat = 0
      this.speed = 0
    });

    // Listen for messages
    this.socket.addEventListener('message', (event)=> {
        var data = event.data;

        if (!!data) {
          var obj = JSON.parse(data);
            if (!!obj.original_artist) {
                this.content = (<div><h1>{obj.title}</h1><h2>{obj.original_artist}</h2></div>)
            } 
            if (!!obj.lyrics) {
              this.lyrics = obj.lyrics
            }
            if (!!obj.beat) {
              this.beat = obj.beat
              this.speed = obj.beatLength
              console.log(this.lyrics[obj.beat])
              var lyric = this.lyrics[obj.beat].lyric
              if (!!lyric) {
                this.content = <h1>{this.lyrics[obj.beat].lyric}</h1>
              }
            }
        }
    });
  }

  render () {
    return (<div>{this.content}</div>)
  }
}

export default App
