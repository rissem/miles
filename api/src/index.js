const express = require('express')
const http = require('http')
const app = express()
const bodyParser = require('body-parser')
const db = require('./db')
const WebSocket = require('ws')
const url = require('url')
const quantizeSong = require('./quantizeSong')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

function currentSong() {
  return db.query(`SELECT * FROM songs where id=(SELECT song_id from
    SELECTED ORDER BY selected_at DESC LIMIT 1)`, []).then((result) => {
      return quantizeSong(result.rows[0])
    })
}

wss.on('connection', function connection(ws, req) {
  const location = url.parse(req.url, true)
    ws.on('message', function incoming(message) {
      message = JSON.parse(message)
      if (message.type === "triangle"){
        //store this triangle hit
        //send best beat guess
      }
    })

  //send user current song data as soon as they connect
  currentSong().then((song)=>{
    console.log("EH?")
    ws.send(JSON.stringify(song))
  })

  setInterval(()=>{
    //send best beat guess
    ws.send("heartbeat")
  }, 5000)
})

app.get('/songs', function (req, res) {
  db.query('SELECT id, original_artist, title from songs ORDER BY title', []).then((result) => {
    res.send(JSON.stringify(result.rows))
  }).catch((e) => {
    console.error('ERROR', e)
    res.send('Error!', e)
  })
})

app.get('/song/:id', function (req, res) {
  db.query('SELECT * FROM songs where id=$1::int', [req.params.id]).then((result) => {
    res.send(JSON.stringify(result.rows[0]))
  }).catch((e) => {
    console.error('ERROR GETTING SONG', e)
    res.send('Errr', e)
  })
})

app.post('/song/:id', function (req, res) {
  db.query('UPDATE songs set data=$1::json where id=$2::int', [req.body.data, req.params.id]).then((result) => {
    res.send('we did it')
  }).catch((e) => {
    console.error('ERROR', e)
    res.send('ERROR!', e)
  })
})

app.post('/selectSong/:id', function(req, res){
  db.query('INSERT INTO selected (selected_at, song_id) VALUES ($1, $2)', [new Date(), req.params.id]).then((result)=>{
    res.send("song selected")
  })
  //push this message to all of the sockets in the pool
})

app.post('/triangle', function(req, res){
  console.log("record triangle hit")
})

server.listen(3000, function () {
  console.log(`Miles API listening on port ${server.address().port}`)
})
