#! /bin/bash
pg_dump -h postgres -U postgres postgres > /app/dump
