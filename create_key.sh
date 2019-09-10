#!/bin/sh
FILE=server/db/.env
if [ ! -f "$FILE" ]; then
    string1=$(echo -n SECRET_KEY=)
    string2=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w ${1:-32} | head -n 1)
    keyString="$string1$string2"
    echo $keyString > $FILE
fi

