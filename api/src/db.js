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

pool.query(`CREATE TABLE IF NOT EXISTS songs (
    id serial,
    created timestamptz,
    original_artist varchar(200),
    title varchar(200),
    file varchar(200)
  )`)

module.exports = {
  query: (q, args) => {
    return new Promise((resolve, reject) => {
      pool.query(q, args, (err, result) => {
        err ? reject(err) : resolve(result)
      })
    })
  }
}
