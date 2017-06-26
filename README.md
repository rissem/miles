# miles

0. Install Docker https://store.docker.com/editions/community/docker-ce-desktop-mac
1. Clone this repo
1. Add some songs into the `api/public` directory
1. `docker-compose up`
2. Connect to database with `./psql.sh` and add those songs to db `INSERT INTO songs (title, original_artist, file) VALUES ('Rick Astley', 'Never Gonna Give You Up', 'never.m4a');`
(TODO interface for adding songs)
3. Visit http://localhost:3000
