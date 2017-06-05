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

function broadcastBeats(){
  db.query(`SELECT * from events WHERE event_at > (SELECT max(selected_at) FROM selected)`)
    .then((result) =>{
      // first 4 beats are are counting in the song
      const lastBeat = result.rows[result.rows.length - 1]
      wss.broadcast(JSON.stringify({beat: result.rows.length - 4,
        time: lastBeat.event_at,
        beatLength: result.rows.length > 4 && (lastBeat.event_at - result.rows[result.rows.length - 4].event_at) / 4
      }))
    })
}

function currentSong() {
  return db.query(`SELECT * FROM songs WHERE id=(SELECT song_id from
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
    ws.send(JSON.stringify(song))
  })

  setInterval(()=>{
    //send best beat guess
    broadcastBeats()
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

//TODO this should probably be sent over the WebSocket
app.post('/triangle', function(req, res){
  db.query('INSERT INTO events (event_type, event_at) VALUES ($1, $2)',
    ["triangle", new Date()]).then(()=>{
      res.send("OK")
      broadcastBeats()
    })
})

server.listen(3000, function () {
  console.log(`Miles API listening on port ${server.address().port}`)
})
