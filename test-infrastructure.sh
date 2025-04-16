#!/bin/bash
set -e -u

run() {
    echo "Running $*" >&2
    chronic "$@"
}
yarn2() {
    run yarn "$@"
}

#nvm use
rm -rf node_modules/
yarn2 install
run npx tsc
yarn2 localize
yarn2 script-example --dhis2-url="https://play.im.dhis2.org/dev" --dhis2-auth="admin:district"
yarn2 build
yarn2 lint
yarn2 generate-docs
yarn2 test

echo "Done!" >&2
