CREATE TABLE songs (
    id integer PRIMARY KEY,
    created timestamp with time zone,
    original_artist character varying(200),
    title character varying(200),
    file character varying(200),
    data jsonb
);

CREATE TABLE selected (
  selected_at timestamp with time zone,
  song_id integer NOT NULL REFERENCES songs(id)
);
