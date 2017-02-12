import React, { Component } from 'react'
import './App.css'
import $ from 'jquery'
import Chooser from './Chooser'

// for developer convenience
window.$ = $

class App extends Component {
  render () {
    return (
      <div>
        <Chooser />
      </div>
    )
  }
}

export default App
