const express = require('express')
const app = express()
const db = require('./db')
app.use(express.static('public'))

app.get('/hello', function (req, res) {
  db.query('SELECT $1::text as name', ['brianc']).then((result) => {
    res.send(JSON.stringify(result))
  }).catch((e) => {
    console.error('ERROR', e)
    res.send('Error!', e)
  })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
