const pg = require('pg')

const config = {
  user: 'postgres', // env var: PGUSER
  database: 'postgres', // env var: PGDATABASE
  password: 'postgres', // env var: PGPASSWORD
  host: 'postgres', // Server hosting the postgres database
  port: 5432, // env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
}

const pool = new pg.Pool(config)

let connect = () => {
  return new Promise(function (resolve, reject) {
    pool.connect((err, client, done) => {
      err ? reject(err) : resolve(client, done)
    })
  })
}

const query = (client, query, args) => {
  return new Promise(function (resolve, reject) {
    client.query(query, args, function (err, result) {
      err ? reject(err) : resolve(result)
    })
  })
}

module.exports = {
  query: (q, args) => {
    return connect().then((client, done) => {
      return query(client, q, args)
    }).then((result) => {
      return Promise.resolve(result.rows)
    })
  }
}
