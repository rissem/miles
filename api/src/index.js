const express = require('express')
const http = require('http')
const app = express()
const bodyParser = require('body-parser')
const db = require('./db')
const WebSocket = require('ws')
const url = require('url')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })
wss.on('connection', function connection(ws, req) {
  const location = url.parse(req.url, true)
  console.log('connected', req.url, location)
  ws.on('message', function incoming(message) {
    console.log('received: %s', message)
  })

  ws.send('something')

  setInterval(()=>{
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

server.listen(3000, function () {
  console.log(`Miles API listening on port ${server.address().port}`)
})
