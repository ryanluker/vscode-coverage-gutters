#!/bin/bash

CURRENT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )"
if [ -z "$CURRENT_DIR" ]; then
    CURRENT_DIR="/"
fi

sed -e "s|ROOT_DIR|$CURRENT_DIR|g" cov.xml.template > cov.xml