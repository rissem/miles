#! /bin/bash
docker-compose run --rm postgres pg_dump -h postgres -U postgres postgres > dump
