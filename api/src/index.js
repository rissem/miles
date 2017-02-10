const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const db = require('./db')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/songs', function (req, res) {
  db.query('SELECT id, original_artist, title from songs ORDER BY title', []).then((result) => {
    res.send(JSON.stringify(result.rows))
  }).catch((e) => {
    console.error('ERROR', e)
    res.send('Error!', e)
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

app.listen(3000, function () {
  console.log('Miles API listening on port 3000!')
})
