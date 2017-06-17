#! /bin/bash
docker run --network miles_default  -v `pwd`:/app -it --rm postgres /app/containerDump.sh
